# Project Research Summary

**Project:** Tail History View — Insights (insights.viasat.com)
**Domain:** Per-aircraft connectivity analytics dashboard with synchronized multi-chart zoom, animated playback timeline, and dynamic chart builder
**Researched:** 2026-05-04
**Confidence:** HIGH (stack verified against live sources; architecture drawn from official HighCharts patterns)

---

## Executive Summary

The Tail History View is a data-dense analytics dashboard built inside an existing React/TypeScript platform with firm technology constraints. Every major stack decision is already made by the Insights ecosystem: React 18, TypeScript 5, MUI v6, Emotion styled(), Zustand, React Query, and HighCharts. The work is not technology selection — it is correct implementation of three technically complex interactions on top of that mandated stack: synchronized multi-chart zoom, an animated playback scrubber tied to a live map, and a dynamic chart builder with 80+ metrics.

The recommended approach is to build in dependency order and prove the hardest patterns early. The synchronized zoom mechanism — which requires a feedback-loop guard, an imperative chart registry held in refs (not Zustand), and full-window data fetching so zoom never triggers a refetch — must be validated with two charts before the full chart suite is built. Discovering a flaw in that pattern after 10 charts are built is expensive. Similarly, the playback animation must use requestAnimationFrame with useRef guards for the playing state; putting animation position into Zustand causes 60fps re-renders across every subscribed component and makes the UI unusable during playback.

The primary risk is the HighCharts setExtremes feedback loop, which will cause a browser hang if not implemented with the trigger guard from day one. Secondary risks are turboThreshold silently truncating aviation telemetry data (1-minute resolution over 14 days already exceeds the default 1,000-point limit), and React key instability in the custom chart builder causing chart re-mounts and zoom state loss when users reorder charts. All three risks are fully preventable with known patterns — the danger is not knowing they exist before implementation begins.

---

## Key Findings

### Recommended Stack

The Insights platform ecosystem fully determines the stack. The only non-obvious choices are in the map tier and the HighCharts wrapper version. For the map, MapLibre GL JS via react-map-gl is the correct choice: it is the open-source Mapbox GL JS fork with identical API, no usage-based pricing, WebGL rendering for smooth animated flight paths, and data-driven line styling for RAG-colored route segments. react-leaflet v5 requires React 19 and cannot be used; Mapbox GL JS carries proprietary pricing risk. For HighCharts, the official wrapper is now `@highcharts/react` v4.2.1 (the new component-based API), not the legacy `highcharts-react-official` package — do not mix both.

**Core technologies:**
- React 18 + TypeScript 5: UI runtime — ecosystem constraint, no flexibility
- MUI v6 + Emotion styled(): component library and styling — ecosystem constraint; do NOT upgrade to MUI v7-v9
- HighCharts 12.x + `@highcharts/react` 4.2.1: charting engine + official React wrapper — HighCharts already in platform; use x-range series (not Highcharts Gantt product) for the Events Timeline to avoid a separate license
- MapLibre GL JS 5.x + react-map-gl 8.1.1: map rendering — open-source, free, WebGL-capable; import via `react-map-gl/maplibre`
- Zustand 5.x: state management — ecosystem constraint; use `createViewStore()` pattern for view-specific state; no Redux, no React Context
- TanStack React Query 5.x: server state and caching — ecosystem constraint; one query per metric keyed by `[tail, tailId, metric, metricId, timeRange]`
- `@viasat/insights-components` + `@viasat/insights-spa-package`: platform shared UI and routing conventions
- `@dnd-kit/core` + `@dnd-kit/sortable`: drag-to-reorder for custom charts — react-beautiful-dnd is archived (August 2025), do not use it

**Critical version constraint:** MUI is pinned at v6. Do not upgrade. Upgrading breaks `@viasat/insights-components` compatibility.

See `.planning/research/STACK.md` for full version list, installation commands, and what-not-to-use table.

### Expected Features

Aviation NOC engineers and airline IT analysts expect a baseline set of features before they trust the tool. The custom chart builder and synchronized zoom are what make this view worth building — they are the stated core value and the differentiator from generic fleet dashboards.

**Must have (table stakes):**
- Date range selector with 14-day default — all chart queries depend on this
- Timezone-aware display (UTC) — flight data spans timezones; mismatched display causes misread outages
- Per-chart loading indicators — page-level spinner blocks users from reading charts that loaded faster
- Flight path map with RAG-colored connectivity segments — spatial context is foundational
- Beam/satellite overlay toggle on map — PROJECT.md requirement
- Events Timeline (gantt-style: Disconnected / Acquiring / Connected / Network Change) — first chart NOC users look for
- Service Availability, Latency, Usage, iQe Score default charts — SLA baseline metrics
- Tail number displayed prominently, breadcrumb navigation, error states with actionable messages
- Empty state handling ("No data for this period") — blank axes cause user distrust

**Should have (differentiators):**
- Custom chart builder with 80+ metric selector, chart type selection, session persistence, drag-to-reorder, and category grouping with search — this is the primary v1 differentiator
- Synchronized chart zoom (drag-to-zoom on any chart, all charts follow) — the single most requested missing feature in multi-chart analytics tools
- Playback timeline with scrubber, animated play, snap-to-event markers, and chart crosshair sync
- Shareable URLs encoding date range, tail ID, and zoom state — engineers need to share exact problem views with colleagues; this is consistently missed in v1
- Crosshair sync across all charts on hover — faster than zooming for correlation analysis
- CSV export per chart for the zoomed range

**Defer to v2+:**
- Fleet comparison / multi-tail view — different data model, different product surface
- Real-time tracking — explicitly out of scope; WebSocket infrastructure not in scope
- Alert rule creation — belongs in a separate alerting product
- Custom chart persistence across sessions (backend user preference API not in scope) — localStorage as middle-ground post-v1
- Print/PDF export of full page — HighCharts canvas rendering rabbit hole; CSV is the v1 substitute
- Predictive/AI-generated insights — requires ML pipeline; analytical foundation must exist first

See `.planning/research/FEATURES.md` for the full feature dependency graph and power-user-needs analysis.

### Architecture Approach

The architecture has four layers: data fetching (React Query, one query per chart per time window), shared view state (Zustand store with timeRange, zoomedRange, playhead, playback, and customCharts slices), chart coordination (a useRef-held Map registry of HighCharts instances owned by ChartPanel — never Zustand, never React state), and rendering (page shell, feature components, and chart strips). The critical architectural constraint is that HighCharts chart instances are mutable objects that live outside React's render cycle; they cannot be stored in Zustand or React state without causing stale closures and unnecessary re-renders. Data is always fetched at the full timeRange — zoom is a client-side view operation that never triggers a refetch.

**Major components:**

1. `TailHistoryPage` — route entry, URL param parsing, date range picker, layout shell; writes `timeRange` to store
2. `FlightMapComponent` — MapLibre map with RAG-colored GeoJSON LineString segments; reads `playhead` and `timeRange` from store; read-only consumer
3. `PlaybackBar` — MUI Discrete Slider, play/pause/speed controls, flight event marks; reads `zoomedRange` and `playhead`; writes `playhead` and `playback` state
4. `ChartPanel` — container for all chart strips; owns the `chartRegistryRef` Map; passes `registerChart`/`unregisterChart` callbacks as props
5. `DefaultChartStrip` / `CustomChartStrip` — individual HighCharts instances; register on mount, unregister on unmount; write `zoomedRange` on zoom, read it via `useChartSync` effect
6. `ChartBuilderDrawer` — metric selector with search and category grouping, chart type picker; appends `ChartDefinition` to `customCharts` in store
7. `useChartSync` hook — lives in ChartPanel; applies `zoomedRange` changes imperatively to all registered chart instances via `setExtremes` with `trigger: 'sync'` guard
8. `usePlaybackEffect` hook — rAF loop driving `playhead` forward; uses `useRef` for isPlaying guard; writes to Zustand only at user-meaningful granularity

See `.planning/research/ARCHITECTURE.md` for the full component responsibility table, state location table, data flow diagram, and implementation code patterns.

### Critical Pitfalls

1. **setExtremes feedback loop (synchronized zoom)** — Chart A zooms, triggers B and C, which re-trigger A, infinite browser hang. Prevention: pass `{ trigger: 'syncExtremes' }` as the fifth argument on every programmatic `setExtremes()` call and guard with `if (e.trigger === 'syncExtremes') return` in every handler. Implement the guard before any zoom testing — it is not incrementally fixable.

2. **turboThreshold silently truncating data** — HighCharts drops series data above 1,000 points with no visible error; aviation telemetry at 1-minute resolution over 14 days is 20,160 points. Prevention: set `plotOptions.series.turboThreshold: 0` in the shared chart defaults config on day one, before any real API data is wired up.

3. **Zustand subscriptions at 60fps during playback** — Storing playback cursor position in Zustand and subscribing from 10+ components causes 60 React render cycles per second; UI becomes unusable. Prevention: hold animation position in `useRef`; drive HighCharts crosshair updates via `chart.xAxis[0].drawCrosshair()` imperatively in the rAF loop; write to Zustand only when the user scrubs or playback starts/stops.

4. **rAF stale closure trapping isPlaying** — A `requestAnimationFrame` loop that captures `isPlaying` from React state at effect creation time will never stop when the user clicks Stop. Prevention: store `isPlaying` in both `useState` (for React rendering) and `useRef` (for rAF closure check); always `cancelAnimationFrame` in effect cleanup.

5. **React key instability in custom chart builder** — Using array index or metric ID as the React key causes chart re-mounts on reorder (destroying HighCharts instances, losing zoom context) or stacked duplicate series on metric change. Prevention: assign a stable UUID to each chart slot at creation time; use that UUID as the React key; update the chart instance imperatively when the metric changes (`series.remove()` then `chart.addSeries()`).

**Additional pitfalls to watch:**
- Boost module breaking the Gantt/Events Timeline series (Boost does not support `gantt` series type) — apply Boost at series level only, never chart-globally
- DateTime axis UTC/local mismatch — set `Highcharts.setOptions({ time: { useUTC: true } })` globally at app init before any chart renders; extremely hard to retrofit
- Chart reflow not called after container resize — add `ResizeObserver` + `chart.reflow()` to every chart container component

See `.planning/research/PITFALLS.md` for full code examples and phase-specific warning table.

---

## Implications for Roadmap

The feature dependency graph and architecture build-order analysis both point to the same phase sequence. The synchronized zoom is the highest-risk architectural pattern and must be proven with two charts before the full suite is built. The playback timeline depends on chart instances being stable. The custom chart builder depends on the chart strip pattern being stable. The map is somewhat independent but benefits from `playhead` being stable.

### Phase 1: Foundation and Store Shape

**Rationale:** Every subsequent component depends on the Zustand store shape being stable. Changing state slice names or shapes after 8 charts are built cascades everywhere. HighCharts module initialization and global defaults (useUTC, turboThreshold) must be set before the first chart renders.
**Delivers:** Working project scaffold with store defined, React Query configured, HighCharts initialized with correct global settings, and `TailHistoryPage` shell with layout regions stubbed.
**Addresses:** Date range picker (store writes `timeRange`), page shell, tail identifier display, breadcrumb navigation
**Avoids:** UTC/local mismatch (Pitfall 9), turboThreshold data loss (Pitfall 7), TypeScript bundle mixing (Pitfall 10)
**Research flag:** Standard patterns — skip phase research. Store shape follows `createViewStore()` pattern already established in Insights ecosystem.

### Phase 2: Single Chart + Synchronized Zoom (Prove the Hard Part Early)

**Rationale:** The synchronized zoom is the highest-risk pattern in the project. Prove it works correctly with two charts (e.g., Latency and Service Availability) before building the other eight. A flaw discovered here after 10 charts are wired is expensive to fix.
**Delivers:** Two working HighCharts instances with drag-to-zoom synchronized via `zoomedRange` Zustand slice, the chart registry ref in ChartPanel, `useChartSync` effect with `trigger: 'sync'` guard, and zoom reset affordance.
**Avoids:** setExtremes feedback loop (Pitfall 1) — must implement trigger guard before any zoom testing; Highcharts.charts null entries (Pitfall 11)
**Research flag:** Standard patterns — the official HighCharts synchronized-charts demo covers this exactly.

### Phase 3: All Default Charts

**Rationale:** Once the chart strip pattern and zoom sync are proven, the remaining default charts are parallelizable implementation work. Low risk. The Events Timeline (gantt-style) is the only chart requiring special treatment: use x-range series (not HighCharts Gantt product, which requires a separate license) and never apply Boost globally.
**Delivers:** All default charts rendering real API data: Events Timeline, iQe Score, Service Availability, CIR Satisfaction, CIR Fulfillment, Traffic Composition, Latency, Usage, Beam metrics, Antenna Pointing. All synchronized on zoom.
**Addresses:** All default chart requirements from PROJECT.md; empty state handling; per-chart loading indicators; error states
**Avoids:** Boost breaking Gantt series (Pitfall 6); chart options object recreated on every render (Pitfall 3) — establish useMemo discipline here
**Research flag:** Standard patterns for most charts. Events Timeline needs careful attention to x-range series configuration vs. Gantt license distinction.

### Phase 4: Playback Timeline

**Rationale:** Charts must be stable before testing the crosshair. PlaybackBar also consumes `zoomedRange` which must be working from Phase 2-3. The rAF loop architecture must be designed correctly from first implementation — retrofitting the useRef guard pattern is a larger refactor.
**Delivers:** MUI Discrete Slider scrubber with snap-to-event marks, play/pause/speed controls, animated rAF-driven playback, playhead plotLine crosshair on all charts, and map segment highlighting driven by playhead.
**Avoids:** rAF stale closure (Pitfall 5), Zustand subscriptions at 60fps (Pitfall 4), MUI slider / HighCharts pointer event conflict (Pitfall 12)
**Research flag:** The rAF + useRef pattern for animation is well-documented in React and MDN. MUI Discrete Slider snap-to-marks behavior is documented. Crosshair sync via `chart.xAxis[0].update()` imperative path is the correct pattern.

### Phase 5: Custom Chart Builder

**Rationale:** Depends on the chart strip pattern being stable from Phase 2-3. Metric library must be defined. The React key strategy (stable UUID per slot) and the drag-to-reorder library choice (dnd-kit, not the archived react-beautiful-dnd) must be established before the builder UI is wired up — retrofitting is a significant refactor.
**Delivers:** ChartBuilderDrawer with searchable metric selector (80+ metrics, category-grouped), chart type picker, add/remove chart actions, session-persistent custom chart list, drag-to-reorder, and CustomChartStrip integrated into the chart registry and zoom sync.
**Addresses:** Custom chart builder requirements from PROJECT.md; metric grouping; metric search; session persistence; chart reordering
**Avoids:** React key instability on reorder (Pitfall 8); HighCharts instance leak on repeated add/remove (Pitfall 2)
**Research flag:** dnd-kit integration patterns are MEDIUM confidence (docs inaccessible during research; confirmed via GitHub). May benefit from a focused implementation spike before committing to the full drag-to-reorder implementation.

### Phase 6: Flight Map

**Rationale:** Map is somewhat independent of the chart work, but benefits from `playhead` being stable (Phase 4) so the map segment animation can be tested against a working scrubber. Can be parallelized with Phase 5 if team capacity allows.
**Delivers:** MapLibre GL JS map with GeoJSON LineString flight path split into RAG-colored segments by connectivity state, airport/waypoint labels, flight leg separation, beam/satellite overlay toggle, standard zoom/pan, and playhead-driven segment highlighting.
**Addresses:** All map requirements from PROJECT.md including beam overlay toggle
**Research flag:** MapLibre + react-map-gl RAG segment pattern is well-documented (GeoJSON LineString with data-driven `line-color`). MapTiler free tier API key and rate limits need validation before production deployment — MEDIUM confidence on pricing.

### Phase 7: Power User Workflow Finishes

**Rationale:** These features are high value but depend on all charts and the map being stable. Shareable URLs in particular require all view state to be serializable, which is easiest to implement once the state shape is final.
**Delivers:** Shareable URLs encoding tail ID, date range, and zoom state; synchronized hover crosshair across all charts; CSV export for zoomed range; and any remaining polish (timezone selector if validated by user research, "no data vs. data is zero" distinction with API support).
**Addresses:** Power user workflow needs identified in FEATURES.md as frequently missed in v1
**Research flag:** URL state serialization is a standard pattern. Hover crosshair sync via HighCharts shared tooltip/crosshair is well-documented.

### Phase Ordering Rationale

- **Foundation first** because store shape instability is the most expensive downstream problem.
- **Zoom sync second** because it is the highest-risk pattern and failing fast here is cheap; failing late is not.
- **Default charts third** because they are low-risk once the chart strip pattern is proven, and they validate the API data contract.
- **Playback fourth** because it requires stable chart instances and the zoom range state to be working.
- **Custom builder fifth** because it is the most complex UI feature and depends on the chart strip pattern being thoroughly tested.
- **Map sixth** because it is architecturally independent and can slip without blocking core chart analytics.
- **Power user finishes last** because they depend on all state being final and all charts working.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against live sources. Only gap: MapTiler rate limits on free tier (MEDIUM — validate before production). |
| Features | MEDIUM | Table stakes and anti-features are well-grounded in domain knowledge. "Power user needs often missed" section should be validated with 2-3 Viasat customer success or airline IT interviews before final phase scope. |
| Architecture | HIGH | Synchronized zoom pattern is from official HighCharts demo. React/Zustand patterns from official docs. Chart registry ref pattern is well-established. |
| Pitfalls | HIGH | HighCharts-specific pitfalls verified against official docs and demos. React/rAF patterns from React docs and MDN. |

**Overall confidence:** HIGH

### Gaps to Address

- **API contract:** Backend endpoints exist but no documentation is available yet. All chart data fetching (Phase 3+) depends on knowing the response shape, field names, time resolution, and whether data gaps vs. zero values are distinguishable. Resolve with backend team before Phase 3 begins. This is the single most likely planning blocker.

- **Metric library source:** The 80+ metric list must come from somewhere — a backend API endpoint or a hardcoded manifest. This must be resolved before Phase 5 (custom chart builder). If it comes from an API, add a query to load it once on mount and store in Zustand `metricLibrary` slice.

- **MapTiler API key and rate limits:** Free tier confirmed; pricing and rate limits at production traffic volumes not validated. Confirm with infrastructure team before Phase 6 ships.

- **Highcharts license scope:** Confirmed that x-range series is included in the core HighCharts license and the Gantt product requires a separate license. Confirm Viasat's current license tier covers x-range and the Boost module before Phase 3 begins.

- **Feature validation via user research:** The "power user needs" list (shareable URLs, crosshair sync, no-data vs. zero distinction, timezone selector, per-chart loading) is grounded in domain knowledge but not validated against actual Viasat customers. Recommend 2-3 interviews with airline IT or customer success before locking Phase 7 scope.

---

## Sources

### Primary (HIGH confidence)
- PROJECT.md (authoritative) — all ecosystem constraints, requirements, out-of-scope items
- HighCharts changelog (live) — v12.6.0 current; v12 released Nov 2024
- `@highcharts/react` package.json (live) — v4.2.1 confirmed as official wrapper replacing `highcharts-react-official`
- HighCharts API: `xAxis.events.setExtremes`, `chart.zooming`, x-range series docs (live)
- HighCharts synchronized-charts official demo — `trigger: 'syncExtremes'` pattern
- HighCharts Boost module docs — supported series types, `gantt` not supported
- react-map-gl releases (live) — v8.1.1 confirmed, MapLibre endpoint via `react-map-gl/maplibre`
- MapLibre GL JS docs (live) — v5.24.0 current, open source
- react-leaflet releases (live) — v5 confirmed requires React 19, incompatible with platform
- TanStack Query releases (live) — v5.100.9 current
- Zustand releases (live) — v5.0.12 current
- MUI installation docs (live) — v9 current upstream; v6 mandated by platform
- MDN `requestAnimationFrame` — stale closure, cleanup pattern
- React official docs — `useRef` for mutable values, selector discipline

### Secondary (MEDIUM confidence)
- dnd-kit docs (inaccessible during research; confirmed via GitHub package description) — `useSortable`, `SortableContext`, `arrayMove` patterns
- HighCharts synchronized-charts demo (description-confirmed, not live-fetched) — `afterSetExtremes` pattern
- Domain knowledge — aviation SATCOM connectivity monitoring platforms (Viasat, Inmarsat GX, Panasonic Avionics, Anuvu), NOC tooling patterns, analytics dashboard UX

### Tertiary (needs validation)
- MapTiler free tier rate limits — confirmed free tier exists; production pricing not verified
- Backend API shape and data gap representation — no documentation available; validate with backend team before Phase 3

---

*Research completed: 2026-05-04*
*Ready for roadmap: yes*
