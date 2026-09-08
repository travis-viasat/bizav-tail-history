# Phase 3: Default Charts - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

All 8 default charts render on the Tail History page. Each chart fetches its own data independently, participates in zoom sync via ChartStrip + useChartSync, and handles loading, error, and empty states. Phase 3 uses mock data stubs (not real API calls) so work can proceed without backend endpoint contracts.

</domain>

<decisions>
## Implementation Decisions

### API Data Strategy
- **D-01:** Build all 8 charts against typed TypeScript mock data stubs — each chart defines its own interface and a mock hook that returns synthetic data. Real `useFetch` calls are swapped in once backend provides endpoint contracts. No placeholder API URLs in Phase 3 code.

### Chart Groupings
- **D-02:** CHART-07 (Usage) — **1 combined chart strip** with 3 series: Download Usage, Upload Usage, and Cumulative Usage plotted together as separate colored lines.
- **D-03:** CHART-08 (Beam & Antenna) — **Separate chart strips** for each metric. Exact count and ordering follows the Figma design (node 530-51991). Researcher must read the Figma to determine the strip breakdown before planning.

### Loading States
- **D-04:** While a chart is fetching, show an **MUI Skeleton** block at the same height as the chart strip. No spinner, no layout shift.

### Empty States
- **D-05:** When there is no data for the selected tail and time range, show an **inline message** centered inside the chart strip: "No data available for this period." Chart strip remains visible (not hidden).

### RAG Colors (Events Timeline)
- **D-06:** Use standard colors (green/amber/red from Viasat theme or MUI palette) as placeholders in `colors.ts` for Phase 3. Exact Figma hex values for `RAG_CONNECTED`, `RAG_ACQUIRING`, `RAG_DISCONNECTED` will be swapped in before Phase 3 browser verification.

### Claude's Discretion
- Error state (failed fetch): Claude to decide appropriate error treatment (likely matches empty state pattern with an error message)
- ChartStrip wrapper pattern for data-fetching charts: each chart gets a thin wrapper component that calls its mock hook and passes `series` to the existing `ChartStrip`
- Chart ordering on page (top to bottom): follow Figma design node 310-148332
- Zoom sync wiring: all charts use the existing `useChartSync` / `ChartStrip` / `chartRegistryRef` pattern from Phase 2

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/ROADMAP.md` — Phase 3 goal, requirements CHART-01 through CHART-08, success criteria
- `.planning/REQUIREMENTS.md` — Full requirement definitions and acceptance criteria
- `.planning/PROJECT.md` — Project context, constraints, core value

### Phase 2 Patterns (must be replicated)
- `tail-history/src/components/ChartStrip/ChartStrip.tsx` — Reusable chart container; all Phase 3 charts use this
- `tail-history/src/components/ChartStrip/ChartStrip.types.ts` — ChartStripProps interface
- `tail-history/src/hooks/useChartSync.ts` — Zoom sync hook; all Phase 3 charts participate
- `tail-history/src/pages/tailHistory/TailHistoryPage.tsx` — Page root; new charts are added here
- `tail-history/src/pages/tailHistory/__mocks__/chartData.ts` — Mock data pattern to replicate for each chart

### Design Source
- Figma node 310-148332 — Full Tail History page layout (chart ordering, page structure)
- Figma node 530-51991 — Default chart examples (CHART-08 Beam/Antenna ordering, visual spec)

### Tech Reference
- `tail-history/src/theme/colors.ts` — Color constants; RAG_CONNECTED, RAG_ACQUIRING, RAG_DISCONNECTED are placeholders to be updated before browser verify
- `tail-history/package.json` — Installed dependencies (Highcharts 12, @highcharts/react 4.2.1, MUI v6, Zustand)
- `CLAUDE.md` — Project-level constraints (copyright headers, Emotion styled, no hardcoded hex, useFetch pattern)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ChartStrip` (tail-history/src/components/ChartStrip/ChartStrip.tsx): Accepts `chartId`, `title`, `series`, `registerChart`, `unregisterChart`, `onSetExtremes`, `height`. All Phase 3 charts pass through this.
- `useChartSync` (tail-history/src/hooks/useChartSync.ts): Returns `makeSetExtremesHandler` and `resetZoom`. Each chart gets a memoized handler.
- `chartRegistryRef` in TailHistoryPage: `useRef<Map<string, Highcharts.Chart>>` — all charts register/deregister here.
- `tailHistoryStore` (Zustand): `timeRange`, `zoomedRange`, `playhead`, `playback`, `customCharts` slices already exist.
- Mock data pattern: `__mocks__/chartData.ts` uses LCG seeded random walk; replicate this pattern for each Phase 3 chart's mock data.

### Established Patterns
- Module-scope `uuidv4()` for stable chart IDs — outside component body to prevent ID regeneration on re-render
- `useMemo` for `makeSetExtremesHandler` — prevents listener reattachment each render
- `chart.events.load` (not `useEffect`) for chart registration — timing guarantee
- Emotion `styled()` for all styled components — no CSS modules
- Copyright header on every new source file (© 2026 Viasat, Inc.)
- Vitest test for each new component with mocked StockChart

### Integration Points
- `TailHistoryPage.tsx` is where all 8 default charts are added (alongside existing Latency and Packet Loss mock strips from Phase 2 — Phase 3 replaces the mocks with real chart implementations)
- `ZoomControls` sits above the chart stack and already reads from Zustand `zoomedRange`

</code_context>

<specifics>
## Specific Ideas

- CHART-01 (Events Timeline) uses x-range series (`modules/xrange.js`) — not Highcharts Gantt (separate license). RAG colors: standard green/amber/red placeholders, exact Figma values before browser verify.
- CHART-07 (Usage): Download, Upload, Cumulative as 3 series in one strip — users can compare all 3 at a glance.
- CHART-08 ordering: defer to Figma node 530-51991 — researcher must confirm exact strip count and order.
- iQe Score (CHART-02): 4 sub-scores (Download Performance, Upload Performance, Network Availability, Transmission Resilience) + Month-to-date WPS — likely 4-5 line series in one strip.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 scope.

Real API integration (replacing mock stubs with `useFetch` calls) is intentionally deferred to a future task once backend endpoint contracts are available. This is not a new phase — it's a swap-in within the existing chart hooks.

</deferred>

---

*Phase: 03-default-charts*
*Context gathered: 2026-05-05*
