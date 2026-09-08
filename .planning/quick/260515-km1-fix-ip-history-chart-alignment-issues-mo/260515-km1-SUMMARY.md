---
phase: quick
plan: 260515-km1
subsystem: charts / header
tags: [charts, tooltip, alignment, ui, highcharts]
dependency_graph:
  requires: []
  provides:
    - "Unified ChartStrip tooltip with event marker integration"
    - "Add Chart button in PageHeader"
    - "IP History chart margin alignment with ChartStrip"
  affects:
    - "src/components/ChartStrip/ChartStrip.tsx"
    - "src/pages/tailHistory/PageHeader.tsx"
    - "src/pages/tailHistory/TailHistoryPage.tsx"
    - "src/pages/tailHistory/charts/IpHistory/IpHistory.tsx"
tech_stack:
  added: []
  patterns:
    - "Highcharts imperative chart.update() to override vendor baked-in margins"
    - "Highcharts tooltip.formatter with useHTML for unified event + series display"
key_files:
  created: []
  modified:
    - src/components/ChartStrip/ChartStrip.tsx
    - src/pages/tailHistory/PageHeader.tsx
    - src/pages/tailHistory/TailHistoryPage.tsx
    - src/pages/tailHistory/charts/IpHistory/IpHistory.tsx
decisions:
  - "Override vendor margins imperatively via chart.update() with 100ms timeout rather than CSS hacks — preserves clean separation from vendor source"
  - "Use shared tooltip.formatter closure over eventMarkers prop rather than a separate state mechanism — stays in sync automatically on re-render"
  - "Remove showEventCallout/hideEventCallout SVG renderer labels entirely — second tooltip is strictly worse UX than integrated formatter"
metrics:
  duration: "~3 minutes"
  completed: "2026-05-15"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Quick Task 260515-km1: Fix IP History Chart Alignment Issues Summary

**One-liner:** Aligned IP History vendor chart margins to ChartStrip via imperative `chart.update()`, moved "Add Chart" button into PageHeader, and replaced separate SVG event callouts with a unified dark Highcharts HTML tooltip showing timestamp header, two-column series table, and overlapping event section.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix IP History chart alignment + move Add Chart button to header | bd64175 | IpHistory.tsx, TailHistoryPage.tsx, PageHeader.tsx |
| 2 | Unify event marker tooltips with chart tooltip and format all tooltips | b19cc00 | ChartStrip.tsx |

---

## What Was Built

### Task 1: IP History Alignment + Add Chart Button

**IpHistory.tsx:**
- Added `ipChartRef = useRef<Highcharts.Chart | null>(null)` and passed `ref={ipChartRef}` to `<IpHistoryChart>`
- Added `useEffect` that fires a 100ms timeout after mount: calls `chart.update({ chart: { marginRight: 140, marginLeft: undefined, marginTop: 44 } }, true)` on the vendor chart instance
- This overrides the vendor's baked-in `marginLeft: 120` / `spacingRight: 20` from `constants.js` `CHART_CONFIG` without touching vendor source files
- The vendor component uses `React.forwardRef` + `useImperativeHandle` to expose the Highcharts.Chart instance, making the ref approach clean and supported

**PageHeader.tsx:**
- Added `onAddChart?: () => void` to `PageHeaderProps`
- Imported `AddIcon` from `@mui/icons-material/Add`
- Wrapped tail ID `<Text>` and conditional `<Button>` in a `<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>` group
- Button uses `appearance="neutral" kind="outlined" size="sm"` with `iconBefore={<AddIcon />}` per Beam design tokens

**TailHistoryPage.tsx:**
- Removed the `<Box sx={{mt: 2, mb: 1}}>` + `<Button>` "Add Chart" wrapper from the content area
- Removed unused `AddIcon` import and `Button` import (only `Text` remains from beam-react in that file)
- Passed `onAddChart={() => setDrawerOpen(true)}` as a prop to `<PageHeader>`

### Task 2: Unified Tooltip with Event Markers

**ChartStrip.tsx:**
- Removed `showEventCallout()` and `hideEventCallout()` functions that rendered SVG renderer labels as a second floating tooltip
- Removed `events: { mouseover, mouseout }` from all `plotLines` and `plotBands` — visual dashed lines and colored bands remain intact
- Added `buildTooltipHtml(context, eventMarkers)` helper that produces:
  - Timestamp header (`Highcharts.dateFormat('%b %e, %Y %H:%M UTC', x)`) with `font-weight:600; margin-bottom:8px`
  - HTML `<table>` with left-aligned series name and right-aligned `● value unit` per data point
  - Event section (conditionally rendered) with a separator line and colored event labels + optional descriptions
- Wired formatter into `tooltip` config: `useHTML: true`, `backgroundColor: 'rgba(20,20,20,0.88)'`, `style: { color: '#fff' }`, `borderColor: 'transparent'`, `borderRadius: 4`, `padding: 8`

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None — all functional changes are wired to real data flows.

---

## Self-Check: PASSED

- [x] `src/components/ChartStrip/ChartStrip.tsx` — modified and committed at b19cc00
- [x] `src/pages/tailHistory/PageHeader.tsx` — modified and committed at bd64175
- [x] `src/pages/tailHistory/TailHistoryPage.tsx` — modified and committed at bd64175
- [x] `src/pages/tailHistory/charts/IpHistory/IpHistory.tsx` — modified and committed at bd64175
- [x] `npx tsc --noEmit` — zero errors after both tasks
- [x] Commits bd64175 and b19cc00 exist in git log
