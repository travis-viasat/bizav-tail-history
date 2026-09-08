# Features Research — Aviation Connectivity Analytics Dashboard (Tail History View)

**Domain:** Per-aircraft connectivity history and analytics
**Researched:** 2026-05-04
**Confidence:** MEDIUM — web search unavailable; findings drawn from domain knowledge of network operations dashboards, aviation connectivity platforms (Viasat, Inmarsat, Panasonic, Anuvu), and general analytics dashboard UX. Project-specific details validated against PROJECT.md.

---

## Table Stakes

These are the features that aviation connectivity operations users (airline IT, NOC engineers, customer success managers) expect as baseline. Missing any of these causes users to distrust or abandon the tool.

### Time Navigation

- **Date range selector** — Users must be able to set a custom lookback window. A fixed "last 14 days" default is fine; inability to change it is a blocker. | Complexity: Low
- **Timezone-aware display** — Flight data spans multiple timezones. Displaying times without UTC/local toggle causes misinterpretation of outage timing. | Complexity: Medium
- **Loading state indicators** — Fetching 14 days of telemetry can take seconds. Spinners, skeletons, or progress bars per chart are required so users don't assume the page is broken. | Complexity: Low

### Map Visualization

- **Flight path display on a geographic base map** — The core spatial context. Users need to see where the aircraft was, not just when. | Complexity: Medium
- **Connectivity status coloring on path segments** — RAG (Red/Amber/Green) coloring directly on the flight path so outages are spatially located. This is table stakes for any per-tail view. | Complexity: Medium
- **Airport/waypoint labeling** — Origin and destination airports labeled on the map. Users orient themselves by route, not lat/lon. | Complexity: Low
- **Flight leg separation** — Each flight (departure to arrival) rendered as a distinct path segment, not one continuous line across layovers. | Complexity: Medium
- **Map zoom and pan** — Standard interactive map navigation (scroll to zoom, drag to pan). Users explore specific geographic regions where outages cluster. | Complexity: Low (Leaflet/Mapbox baseline)
- **Beam/satellite overlay toggle** — Satellite beam footprints overlaid on the map so users can correlate outages with beam boundaries. Listed in PROJECT.md as a requirement. | Complexity: Medium

### Connectivity Data Charts

- **Events Timeline (gantt-style)** — The most-referenced chart in NOC workflows. Disconnected / Acquiring / Connected / Network Change states over time. Users immediately look for this to understand an outage sequence. | Complexity: Medium
- **Service Availability** — Percentage uptime over the selected window. A key SLA metric; airlines use this in customer reporting. | Complexity: Low
- **Latency** — Raw latency (and packet loss) over time. The first thing network engineers check when users report "the internet felt slow." | Complexity: Low
- **Usage (Download/Upload)** — Traffic volume over time. Needed to distinguish "was the network up?" from "was anyone using it?" | Complexity: Low
- **iQe Score** — Viasat's composite quality-of-experience index. Already defined in PROJECT.md with subcomponents. Users on the Insights platform expect this to be present — it's the platform's primary quality signal. | Complexity: Medium (multiple sub-series in one chart)
- **Empty state handling** — If no data exists for a selected range (aircraft was grounded, data not ingested), charts must clearly say "No data for this period" rather than rendering blank axes. | Complexity: Low

### Navigation and Context

- **Tail identifier displayed prominently** — The aircraft tail number (e.g., N12345) must be visible at all times. Users often have multiple tabs open for different tails. | Complexity: Low
- **Breadcrumb / back navigation** — Users arrive from a fleet list or search. A clear path back to the fleet view is required; a dead-end page causes frustration. | Complexity: Low
- **Error states with actionable messages** — API failures must surface as human-readable errors ("Unable to load flight data — try a shorter date range") not silent blank states. | Complexity: Low

---

## Differentiators

These features set the Tail History view apart from generic fleet dashboards and basic connectivity reports. They represent the primary analytical capability that power users need and rarely get from off-the-shelf tools.

### Custom Chart Builder

- **Metric selector UI with 80+ metrics** — Users choose any metric from the full library and add it as a new chart. This is the core differentiator called out in PROJECT.md. Power users (airline network engineers, Viasat customer success) need to correlate metrics that aren't shown together by default (e.g., CN0 vs. latency vs. beam transition events). | Complexity: High
- **Chart type selection per metric** — Line, bar, area, scatter — users choose the best visual representation for the metric they're analyzing. Scatter is especially valuable for correlation analysis (e.g., SNR vs. throughput). | Complexity: Medium (HighCharts supports all; the UI for selection is the complexity)
- **Session persistence of custom charts** — Custom charts survive page scroll and minor interactions within the session. Losing a custom chart configuration on refresh is a significant pain point in existing tools. | Complexity: Medium (Zustand session state)
- **Custom chart reordering** — Drag-to-reorder custom charts so users can arrange their analysis layout. Power users build a "view" for a specific investigation. | Complexity: Medium
- **Metric grouping in selector** — 80+ metrics need organization. Grouping by category (CIR/MIR, RF/antenna, QoS, modem, usage, iQe) makes the selector usable without scrolling through a flat list. | Complexity: Medium

### Synchronized Chart Zoom

- **Drag-to-zoom on any chart, all charts follow** — The single most requested feature in multi-chart analytics tools that lack it. When investigating an outage window, users need every chart to zoom to the same time range simultaneously. | Complexity: High (HighCharts `chart.zooming` with shared extremes event bus)
- **Zoom reset / "zoom out" affordance** — A clear "Reset Zoom" button or double-click behavior. Without it, users get stuck in a zoomed state and can't find their way back. | Complexity: Low
- **Zoom state persists across scroll** — When a user scrolls to a chart below the fold, the zoom they set on the top chart must still be active. This requires shared zoom state in Zustand, not local chart state. | Complexity: Medium

### Playback Timeline

- **Scrubable timeline slider** — Drag a scrubber through time and see the map update to show aircraft position and connectivity state at that moment. This is a qualitatively different interaction from chart zoom — it's spatiotemporal playback. | Complexity: High
- **Animated playback** — Play button that animates the scrubber forward at configurable speed (slow/normal/fast). Allows users to "watch" a flight unfold without manually dragging. | Complexity: High
- **Snap-to-event markers** — Discrete markers on the slider for flight events (takeoff, landing, beam handover, outage start) and day boundaries. Users can jump to the next event rather than hunting for it. | Complexity: Medium
- **Playback synchronization with charts** — The playback scrubber position reflects on the charts as a time cursor/crosshair, connecting the map playback to the chart data at that moment. | Complexity: High (requires HighCharts crosshair sync with external state)

### Data Depth and Metric Richness

- **Beam metrics (Download/Upload per beam)** — Beam-level breakdown is not available in most fleet-level dashboards. It's essential for diagnosing beam handover issues vs. network-level degradation. | Complexity: Medium
- **Antenna pointing quality (Forward/Return Link)** — Physical-layer signal quality. Requires specialized knowledge to interpret but is the gold standard for isolating hardware problems. | Complexity: Medium
- **CIR Satisfaction and CIR Fulfillment charts** — Committed Information Rate tracking. Airlines with contracted CIR SLAs need this to verify service delivery. Differentiates Viasat's analytics from generic monitoring tools. | Complexity: Medium
- **Traffic Composition chart** — Breakdown of traffic by application category or QoS class. Helps operators understand whether passengers are consuming disproportionate bandwidth. | Complexity: Medium

### Power User Workflow Enablers

- **Chart crosshair across all charts on hover** — When hovering over any chart, a synchronized vertical crosshair appears on all charts at the same timestamp. Faster than zooming for correlating events. | Complexity: Medium (HighCharts shared tooltip/crosshair)
- **Tooltip with precise values on hover** — Hovering shows exact metric values at a point in time. Essential for writing incident reports with accurate data. | Complexity: Low (HighCharts baseline, but must be styled consistently)
- **Direct link to current view (shareable URL)** — Date range, tail ID, and zoom state encoded in the URL so an engineer can share an exact view of a problem with a colleague. Power users use this constantly. Frequently missed in v1 of internal tools. | Complexity: Medium (URL state serialization)
- **Export chart data as CSV** — At least for the zoomed range. Power users need to take data into Excel or Python for deeper analysis. | Complexity: Medium

---

## Anti-Features (Don't Build in v1)

These are capabilities that seem valuable but carry disproportionate complexity, scope risk, or distract from the core analytical workflow. Deliberately exclude them from v1.

| Anti-Feature | Why Avoid | What to Do Instead |
|---|---|---|
| **Fleet comparison / multi-tail view** | Requires a fundamentally different data model and layout. The Tail History view is intentionally per-tail. Multi-tail is a separate product surface. | Provide a clear link back to the fleet list for tail-to-tail navigation. |
| **Live / real-time tracking** | Explicitly out of scope per PROJECT.md. WebSocket infrastructure, data freshness indicators, and auto-refresh UX are substantial additional work. | Display a "last updated" timestamp so users know the data age. |
| **Alert rule creation** | Threshold-based alerting (e.g., "alert me when iQe drops below 3") is an ops workflow, not an analytics workflow. Belongs in a separate alerting product. | Surface the data that would feed an alert; let users draw their own conclusions. |
| **Annotation / comment system** — marking events on charts | Valuable for team collaboration but requires a new backend service (annotations storage) that is out of scope. | If annotations are needed, defer to a future milestone when backend support exists. |
| **URL-based saved views / bookmarks** | Deeper than shareable URL — a named, persisted "saved view" requires user profile storage backend. v1 should do session-only persistence. | Do shareable URLs (URL state serialization) as the v1 substitute. |
| **Predictive / AI-generated insights** — "Your iQe dropped because of beam congestion" | Requires ML pipeline investment. The analytical foundation (charts, zoom, playback) must exist first for users to form their own insights. | Label axes clearly; let the data speak. AI overlay is v3+. |
| **Mobile-native optimization** | Explicitly out of scope per PROJECT.md. HighCharts synchronized zoom and a scrubable timeline do not degrade gracefully on touch/mobile. | Ensure the layout doesn't break at 1280px; no further mobile investment. |
| **Custom chart persistence across sessions** (saved to backend) | Requires user preference API. v1 scope is session-only. | Clear documentation that charts reset on reload; consider localStorage as a low-complexity middle ground post-v1. |
| **Print / PDF export of full page** | Full-page export at high fidelity with multiple HighCharts instances is a known engineering rabbit hole (canvas rendering, print CSS, layout freezing). | CSV export per chart is the v1 substitute. |

---

## Feature Dependencies

Understanding which features gate others is critical for phase sequencing. A dependency arrow (A → B) means B cannot be built until A is complete.

```
Date Range Picker
  → All chart data fetching (charts don't know what time window to query without this)
  → Map flight path rendering
  → Playback timeline (slider range is derived from the selected date range)

Flight Path Map (base rendering)
  → RAG color segments on path (need the path before you can color it)
  → Beam/satellite overlay (overlay sits on top of the base map)
  → Playback timeline position (map position update is driven by scrubber state)

Events Timeline Chart (gantt)
  → Playback snap-to-event markers (event markers are derived from the events timeline data)
  → Crosshair sync (events timeline is the reference chart for time correlation)

HighCharts chart instance (any single chart working)
  → Synchronized zoom (requires shared extremesChanged event bus across multiple chart instances)
  → Synchronized crosshair on hover (same shared event bus)
  → Playback chart cursor (requires chart instances to accept external time position)

Synchronized zoom (shared zoom state in Zustand)
  → Zoom-aware playback (playback slider must constrain to the zoomed time window)

Custom Chart Builder — metric selector UI
  → Individual custom chart rendering (must select before rendering)
  → Custom chart reordering (must have at least one custom chart to reorder)
  → Session persistence of custom charts (must build before persisting)

API contract with backend team
  → All chart data (no charts without data)
  → Metric library for custom chart builder (the 80+ metric list must come from somewhere — API or hardcoded manifest)
```

**Critical path for v1:**
Date range picker → API contracts → Events Timeline + default charts working → HighCharts shared zoom → Playback timeline → Custom chart builder

The custom chart builder and synchronized zoom are both high complexity and depend on HighCharts chart instances being stable. These should be built after the default charts are working and data fetching is proven.

---

## Power User Needs Often Missed

This section specifically addresses the "what do power users need that's often missed" question. Based on NOC engineer and airline IT analyst workflows in connectivity monitoring tools:

1. **Crosshair sync across all charts on hover** — Power users do correlation analysis. They hover on one chart and need to see the exact same timestamp highlighted on every other chart without zooming. Most v1 dashboard implementations only add this in v2 after user complaints.

2. **Shareable URLs with full view state** — Engineers investigate an issue, find a smoking gun in a zoomed time window, then need to share it with their manager or Viasat support. Copy-pasting a URL that drops them on the same zoomed view saves 10 minutes of "scroll to X, zoom to Y, look at the third chart" instructions. Consistently skipped in v1 because it requires URL state serialization infrastructure.

3. **"No data" vs. "data is zero" distinction** — When a metric shows zero, users need to know whether the value was genuinely zero (e.g., no traffic) or the data pipeline had a gap (no reading was taken). Conflating these leads to misdiagnosed incidents. Requires API support but the UI must be able to render gaps differently from zeros (dashed line vs. solid line at zero).

4. **Timezone control** — Operations teams work in UTC; airline customers may expect local time at departure airport. Without an explicit timezone selector, both groups assume the tool is wrong. Often skipped because it feels like a "nice to have" until the first support escalation.

5. **Metric search in custom chart builder** — When the metric list grows to 80+, a flat scrollable list is unusable. A search box within the metric selector reduces the friction from "I know I want CN0 but I can't find it" to immediate access. This is consistently under-built in v1 custom-builder implementations.

6. **Loading state per chart, not page-level** — If six charts load independently and one is slow, a page-level spinner blocks the user from seeing the five that loaded. Per-chart loading indicators let users start reading results immediately. This is often implemented as a page-level spinner in v1 because it's simpler.

---

## Sources

- Project context: `/Users/tyunis/Library/CloudStorage/OneDrive-Viasat,Inc/Documents/GitHub/.planning/PROJECT.md`
- Domain knowledge: Aviation SATCOM connectivity monitoring platforms (Viasat, Inmarsat GX Aviation, Panasonic Avionics, Anuvu), network operations center (NOC) tooling patterns, HighCharts multi-chart synchronization documentation conventions
- Confidence: MEDIUM — web search unavailable in this environment; findings are from training data knowledge of this domain. Recommend validating "Power User Needs Often Missed" section with 2-3 interviews with actual Viasat customer success or airline IT stakeholders before finalizing phase scope.
