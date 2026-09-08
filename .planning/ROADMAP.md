# Roadmap: Tail History View — Insights

**Milestone 1: Core Analytics Dashboard**
**Coverage:** 27/27 v1 requirements mapped
**Granularity:** Standard (5 phases)

---

## Phases

- [ ] **Phase 1: Foundation** - Project scaffold, HighCharts global defaults, Zustand store shape, date range picker, chart registry ref
- [ ] **Phase 2: Zoom Sync** - Prove the setExtremes feedback-loop guard with two charts; establish chart strip pattern
- [ ] **Phase 3: Default Charts** - All 8 default charts rendering real data; all synchronized on zoom
- [ ] **Phase 4: Playback** - rAF-driven playback slider, play/pause/speed, snap-to-event markers, synchronized crosshair
- [ ] **Phase 5: Custom Chart Builder** - Metric selector drawer, chart type picker, add/remove/reorder custom charts

---

## Phase Details

### Phase 1: Foundation
**Goal:** The project scaffold exists with stable infrastructure that all future chart work builds on — store shape, HighCharts defaults, date range picker, and page shell are in place before the first chart renders.
**Depends on:** Nothing (first phase)
**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. The Tail History page loads in the browser, displays the tail identifier, and shows a date range picker defaulting to the last 14 days.
  2. Changing the date range causes all data queries to reload (visible via network requests) without a page refresh.
  3. HighCharts global defaults (useUTC: true, turboThreshold: 0) are set before any chart renders — verified by adding a test chart with more than 1,000 data points and confirming no points are silently dropped.
  4. The Zustand store exposes `timeRange`, `zoomedRange`, and `playhead` slices and can be inspected via Zustand devtools without error.
  5. The chart instance registry (`useRef<Map<string, Highcharts.Chart>>`) is held at the page level and survives navigation without leaking instances.
**Plans:** 2 plans
Plans:
- [ ] 01-01-PLAN.md — Project scaffold, Vite config, Highcharts globals, MUI theme, colors, test infrastructure
- [ ] 01-02-PLAN.md — Zustand store (all 5 slices), useFetch v5, TailHistoryPage with chart registry, PageHeader with date picker
**UI hint**: yes

### Phase 2: Zoom Sync
**Goal:** Synchronized zoom is proven correct with two live charts before the full chart suite is built — the feedback-loop guard is in place and the chart strip pattern is established.
**Depends on:** Phase 1
**Requirements:** ZOOM-01, ZOOM-02, ZOOM-03, ZOOM-04
**Success Criteria** (what must be TRUE):
  1. User can drag a selection on one chart (e.g., Latency) to zoom in; the chart zooms to the selected time range.
  2. When one chart is zoomed, the second chart instantly snaps to the same time range without triggering an infinite loop or browser hang.
  3. The playback slider's visible range narrows to match the zoomed window when any chart is zoomed.
  4. Clicking the Reset Zoom button restores all charts and the slider to the full selected time range.
**Plans:** TBD
**UI hint**: yes

### Phase 3: Default Charts
**Goal:** All 8 default charts render real API data, all participate in zoom sync, and each handles loading, error, and empty states gracefully.
**Depends on:** Phase 2
**Requirements:** CHART-01, CHART-02, CHART-03, CHART-04, CHART-05, CHART-06, CHART-07, CHART-08
**Success Criteria** (what must be TRUE):
  1. All 8 default charts are visible on the page and each shows a per-chart loading indicator while fetching, then renders data for the selected tail and time range.
  2. The Events Timeline renders gantt-style colored bars using x-range series (not HighCharts Gantt product) for Disconnected, Acquiring, Connected, Network Change, and Timing Events states.
  3. Zooming on any one default chart causes all other default charts to zoom to the same range within a single animation frame — no chart is left behind.
  4. When a chart has no data for the selected period, it displays an "No data for this period" empty state instead of blank axes.
  5. Each chart correctly displays its full set of series (e.g., iQe Score shows all 8 line series; CIR Fulfillment shows actual vs. committed bandwidth upstream and downstream).
**Plans:** TBD
**UI hint**: yes

### Phase 4: Playback
**Goal:** Users can scrub, play, and pause through the selected time range; all charts display a synchronized crosshair at the current playhead position running at 60fps without stutter.
**Depends on:** Phase 3
**Requirements:** PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05
**Success Criteria** (what must be TRUE):
  1. User can drag the playback slider to any point in the selected (or zoomed) time range and all charts update their crosshair position to match.
  2. Pressing Play causes the playhead to animate forward automatically; pressing Pause stops it at the current position.
  3. User can switch between Slow, Normal, and Fast playback speeds and the animation rate changes immediately without restarting.
  4. Snap markers are visible on the slider at day boundaries (when range > 1 day) or flight event boundaries (when range <= 1 day); clicking any marker jumps the playhead directly to that point.
  5. The crosshair on all charts updates smoothly at 60fps during playback — no React re-renders fire during animation (verified by React DevTools profiler showing no component re-renders while playing).
**Plans:** TBD
**UI hint**: yes

### Phase 5: Custom Chart Builder
**Goal:** Users can select any of the 80+ available metrics, add a custom chart to the page, and manage their custom chart set — reordering, removing, and building their own analytical views.
**Depends on:** Phase 3
**Requirements:** CUSTOM-01, CUSTOM-02, CUSTOM-03, CUSTOM-04, CUSTOM-05
**Success Criteria** (what must be TRUE):
  1. User can open an "Add Chart" panel that displays all available metrics organized into searchable categories; typing in the search box filters the metric list in real time.
  2. When the user selects a metric, only chart types compatible with that metric's data shape are offered (e.g., a boolean metric does not offer scatter).
  3. After adding a custom chart, it appears on the page, fetches data for the current time range, and participates in zoom sync and playback crosshair alongside all default charts.
  4. User can remove any custom chart they added; the chart disappears from the page and its HighCharts instance is cleaned up (no memory leak).
  5. User can drag custom charts to reorder them; the order persists for the remainder of the session and charts do not re-mount or lose their zoom state during reorder.
**Plans:** TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planning complete | - |
| 2. Zoom Sync | 0/? | Not started | - |
| 3. Default Charts | 0/? | Not started | - |
| 4. Playback | 0/? | Not started | - |
| 5. Custom Chart Builder | 0/? | Not started | - |

---

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| ZOOM-01 | Phase 2 | Pending |
| ZOOM-02 | Phase 2 | Pending |
| ZOOM-03 | Phase 2 | Pending |
| ZOOM-04 | Phase 2 | Pending |
| CHART-01 | Phase 3 | Pending |
| CHART-02 | Phase 3 | Pending |
| CHART-03 | Phase 3 | Pending |
| CHART-04 | Phase 3 | Pending |
| CHART-05 | Phase 3 | Pending |
| CHART-06 | Phase 3 | Pending |
| CHART-07 | Phase 3 | Pending |
| CHART-08 | Phase 3 | Pending |
| PLAY-01 | Phase 4 | Pending |
| PLAY-02 | Phase 4 | Pending |
| PLAY-03 | Phase 4 | Pending |
| PLAY-04 | Phase 4 | Pending |
| PLAY-05 | Phase 4 | Pending |
| CUSTOM-01 | Phase 5 | Pending |
| CUSTOM-02 | Phase 5 | Pending |
| CUSTOM-03 | Phase 5 | Pending |
| CUSTOM-04 | Phase 5 | Pending |
| CUSTOM-05 | Phase 5 | Pending |

**v1 coverage: 27/27 requirements mapped. No orphans.**

---

*Roadmap created: 2026-05-04*
*Last updated: 2026-05-04 after initial creation*
