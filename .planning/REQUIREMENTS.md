# Requirements: Tail History View — Insights

**Defined:** 2026-05-04
**Core Value:** Aviation customers must be able to build and zoom custom connectivity charts across any time window — this is the primary analytical workflow that differentiates the Tail History view.

## v1 Requirements

### Setup & Foundation

- [x] **FOUND-01**: Project scaffolded as a React + TypeScript + MUI v6 application following Insights platform patterns (Zustand, React Query, Emotion)
- [x] **FOUND-02**: HighCharts global defaults configured (useUTC: true, turboThreshold: 0, single import bundle via highcharts/highstock)
- [x] **FOUND-03**: Shared time range Zustand store defined with `timeRange` (full selected range) and `zoomedRange` (current zoom window) slices
- [x] **FOUND-04**: Date range picker rendered with default 14-day lookback; user can change the range and charts reload accordingly
- [x] **FOUND-05**: Chart instance registry implemented as a `useRef<Map<string, Highcharts.Chart>>` held at the page level (not in Zustand)

### Chart Zoom

- [x] **ZOOM-01**: User can drag-select a time region on any chart to zoom in (HighCharts draggable zoom enabled)
- [x] **ZOOM-02**: When user zooms on one chart, all other charts on the page instantly zoom to the same time range (synchronized via `setExtremes` with `trigger: 'syncExtremes'` guard to prevent feedback loops)
- [x] **ZOOM-03**: The playback timeline slider updates its visible range to match the currently zoomed window
- [x] **ZOOM-04**: A reset zoom button restores all charts and the slider to the full selected time range

### Playback Timeline

- [ ] **PLAY-01**: A scrubable playback slider is displayed below the charts; user can drag it to any point in the selected time range
- [ ] **PLAY-02**: User can press Play to animate the current-time marker forward automatically; pressing Pause stops it
- [ ] **PLAY-03**: User can select playback speed (Slow / Normal / Fast)
- [ ] **PLAY-04**: Discrete snap markers appear at meaningful intervals (day boundaries when range > 1 day; flight event boundaries when range ≤ 1 day); user can click any marker to jump directly to that point
- [ ] **PLAY-05**: All charts display a synchronized vertical crosshair at the current playback position; crosshair updates imperatively (not via React re-render) to maintain 60fps performance

### Default Charts

- [ ] **CHART-01**: Events Timeline chart renders gantt-style colored bars for connectivity states: Disconnected (red), Acquiring (amber), Connected (green), Network Change, Timing Events
- [ ] **CHART-02**: iQe Score chart renders multiple line series: iQe Score, Download Performance, Upload Performance, Network Availability, Signal Strength, Beam Transition, Transmission Resilience, Month-to-date WPS
- [ ] **CHART-03**: Service Availability & CIR Satisfaction chart renders Service Availability %, CIR Downstream Sat %, and CIR Upstream Sat % over the selected time range
- [ ] **CHART-04**: CIR Fulfillment chart renders actual bandwidth vs committed information rate (upstream and downstream)
- [ ] **CHART-05**: Traffic Composition chart renders stacked area showing traffic breakdown by type over time
- [ ] **CHART-06**: Latency & Packet Loss chart renders latency (avg, min, max) and packet loss % as line series
- [ ] **CHART-07**: Download Usage, Upload Usage, and Cumulative Usage charts render bytes consumed per direction and a running total
- [ ] **CHART-08**: Beam & Antenna metrics charts render beam download, beam upload, forward link quality, return link quality, and antenna pointing data

### Custom Chart Builder

- [ ] **CUSTOM-01**: User can open a "Add Chart" panel that displays all 80+ available metrics organized into searchable categories
- [ ] **CUSTOM-02**: When a metric is selected, only compatible chart types (line, area, bar, scatter) are offered based on that metric's data shape
- [ ] **CUSTOM-03**: User can add a custom chart to the page; it fetches and renders the selected metric over the current time range and participates in zoom sync and playback crosshair
- [ ] **CUSTOM-04**: User can remove any custom chart they added
- [ ] **CUSTOM-05**: User can drag custom charts to reorder them on the page (drag-to-reorder via dnd-kit)

## v2 Requirements

### Map & Flight Visualization

- **MAP-01**: Interactive flight path map shows aircraft routes with RAG-colored segments (green = connected, amber = acquiring, red = disconnected)
- **MAP-02**: Map defaults to the 14-day lookback range and updates when the date range changes
- **MAP-03**: Map playback: as the user scrubs the timeline, the map animates which flight segment is "current"
- **MAP-04**: Map overlays: satellite name, beam ID, network organization toggles
- **MAP-05**: Map shows flight leg origin and destination with timestamps

### Power User Features

- **PWR-01**: Shareable URL encodes current time range, zoom window, and custom chart configuration so users can share exact views
- **PWR-02**: Crosshair hover sync across all charts (moving mouse over one chart shows a crosshair on all others at the same timestamp)
- **PWR-03**: CSV export of any chart's data for the current time range
- **PWR-04**: Persistent custom chart configuration saved per-user (survives page refresh)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Flight path map (v1) | High complexity; deferred to v2 — user explicitly excluded from v1 scope |
| Backend API development | APIs already exist; this is a frontend-only project |
| Real-time / live tracking | Historical view only — no WebSocket feeds |
| Multi-tail comparison | Requires significant data model changes; out of scope |
| Alert rule creation | Requires backend work; out of scope |
| Annotation / comment system | Requires backend work; out of scope |
| User authentication | Handled by parent Insights platform |
| Mobile native app | Responsive web only |
| HighCharts Gantt module | Requires separate paid license; use x-range series instead for Events Timeline |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1: Foundation | Complete |
| FOUND-02 | Phase 1: Foundation | Complete |
| FOUND-03 | Phase 1: Foundation | Complete |
| FOUND-04 | Phase 1: Foundation | Complete |
| FOUND-05 | Phase 1: Foundation | Complete |
| ZOOM-01 | Phase 2: Zoom Sync | Complete |
| ZOOM-02 | Phase 2: Zoom Sync | Complete |
| ZOOM-03 | Phase 2: Zoom Sync | Complete |
| ZOOM-04 | Phase 2: Zoom Sync | Complete |
| CHART-01 | Phase 3: Default Charts | Pending |
| CHART-02 | Phase 3: Default Charts | Pending |
| CHART-03 | Phase 3: Default Charts | Pending |
| CHART-04 | Phase 3: Default Charts | Pending |
| CHART-05 | Phase 3: Default Charts | Pending |
| CHART-06 | Phase 3: Default Charts | Pending |
| CHART-07 | Phase 3: Default Charts | Pending |
| CHART-08 | Phase 3: Default Charts | Pending |
| PLAY-01 | Phase 4: Playback | Pending |
| PLAY-02 | Phase 4: Playback | Pending |
| PLAY-03 | Phase 4: Playback | Pending |
| PLAY-04 | Phase 4: Playback | Pending |
| PLAY-05 | Phase 4: Playback | Pending |
| CUSTOM-01 | Phase 5: Custom Chart Builder | Pending |
| CUSTOM-02 | Phase 5: Custom Chart Builder | Pending |
| CUSTOM-03 | Phase 5: Custom Chart Builder | Pending |
| CUSTOM-04 | Phase 5: Custom Chart Builder | Pending |
| CUSTOM-05 | Phase 5: Custom Chart Builder | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-04*
*Last updated: 2026-05-04 — traceability updated with final phase assignments after roadmap creation*
