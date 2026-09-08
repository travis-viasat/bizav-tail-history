---
phase: 05-custom-chart-builder
plan: "02"
subsystem: custom-chart-ui-components
tags:
  - add-chart-drawer
  - chart-type-picker
  - custom-chart-section
  - dnd-kit
  - testing
dependency_graph:
  requires:
    - tail-history/src/catalog/metricCatalog.ts
    - tail-history/src/pages/tailHistory/tailHistoryStore.ts
    - tail-history/src/components/ChartStrip/ChartStrip.tsx
    - tail-history/src/pages/tailHistory/charts/CustomChart/useCustomChartMock.ts
  provides:
    - tail-history/src/components/AddChartDrawer/AddChartDrawer.tsx
    - tail-history/src/components/AddChartDrawer/ChartTypePicker.tsx
    - tail-history/src/pages/tailHistory/CustomChartSection.tsx
  affects:
    - Wave 3 wiring into TailHistoryPage (05-03)
tech_stack:
  added: []
  patterns:
    - MUI Drawer (right-anchored) with controlled open/close for metric selector
    - ToggleButtonGroup filtering to metric.compatibleChartTypes only (D-06 rules)
    - dnd-kit SortableContext + useSortable with drag listeners ONLY on drag handle element
    - DndContext mocked via vi.mock('@dnd-kit/core') with onDragEnd test button
    - StockChart mock invokes chart.events.load to trigger registerChart in tests
key_files:
  created:
    - tail-history/src/components/AddChartDrawer/AddChartDrawer.tsx
    - tail-history/src/components/AddChartDrawer/ChartTypePicker.tsx
    - tail-history/src/pages/tailHistory/CustomChartSection.tsx
  modified:
    - tail-history/src/__tests__/MetricSelector.test.tsx
    - tail-history/src/__tests__/ChartTypePicker.test.tsx
    - tail-history/src/__tests__/CustomChartSection.test.tsx
    - tail-history/src/__tests__/CustomChartDnD.test.tsx
decisions:
  - Drag listeners spread on DragHandleIconButton only, never ChartStrip container — prevents dnd-kit from intercepting Highcharts pointer events during zoom selection
  - reorderCustomCharts called only in handleDragEnd, not onDragMove/onDragOver — prevents intermediate state thrash
  - Auto-select first compatibleChartType when user clicks a metric — reduces friction (user can always override via ChartTypePicker)
  - StockChart mock invokes chart.events.load inline so registerChart is testable in jsdom without real Highcharts
  - DndContext mocked to expose onDragEnd via test button — enables drag-end dispatch testing without pointer events
metrics:
  duration_minutes: 20
  completed_date: "2026-05-06"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 4
---

# Phase 05 Plan 02: Custom Chart Builder UI Components Summary

**One-liner:** AddChartDrawer with real-time search and grouped metric list, ChartTypePicker constrained to D-06-compatible types, and dnd-kit CustomChartSection with drag handle isolation — 15 Wave 0 stubs converted to passing tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build AddChartDrawer + ChartTypePicker | 53d968e | AddChartDrawer.tsx, ChartTypePicker.tsx, MetricSelector.test.tsx, ChartTypePicker.test.tsx |
| 2 | Build CustomChartSection with dnd-kit sortable | 1d3b3a3 | CustomChartSection.tsx, CustomChartSection.test.tsx, CustomChartDnD.test.tsx |

## What Was Built

### Task 1: AddChartDrawer + ChartTypePicker (CUSTOM-01, CUSTOM-02)

**ChartTypePicker.tsx:** Renders a MUI `ToggleButtonGroup` (exclusive mode) showing ONLY `metric.compatibleChartTypes` — never all 4 types. Maps type keys to display labels (`line → Line`, etc.). Controlled via `selectedType`/`onSelect` props. Fully Emotion `styled()`, no inline styles.

**AddChartDrawer.tsx:** Right-anchored MUI Drawer (width 400). Internal state: `searchQuery`, `selectedMetric`, `selectedChartType` — all reset via `useEffect` on `open` flip to false. Renders grouped metric list from `METRIC_CATALOG_BY_CATEGORY` — empty categories hidden during search. Auto-selects `metric.compatibleChartTypes[0]` on metric click. Add button disabled until both metric and chart type selected. `handleAdd` calls `onAdd({ metricId, chartType })` then `onClose()`.

**7 tests passing:**
- MetricSelector: Add Chart button visible, drawer opens, all 10 categories rendered, real-time search filters categories
- ChartTypePicker: NUMERIC metric shows line/area/scatter (not bar), event metric shows only bar, Add disabled until selections

### Task 2: CustomChartSection with dnd-kit sortable (CUSTOM-03, CUSTOM-04, CUSTOM-05)

**CustomChartSection.tsx:** Contains `SortableCustomChartStrip` (internal) and `CustomChartSection` (exported).

`SortableCustomChartStrip` uses `useSortable({id: chart.id})` — CSS transform applied to the outer `div` via `ref={setNodeRef}`. Drag `{...attributes} {...listeners}` spread ONLY on `DragHandleIconButton` (not on ChartStrip container). Renders `StripHeader` with drag handle, title, and remove button. Shows `Skeleton` during loading, otherwise `ChartStrip` with chart.id as chartId.

`CustomChartSection` returns `null` when `customCharts.length === 0`. Wraps with `DndContext` (PointerSensor) + `SortableContext` (verticalListSortingStrategy). `handleDragEnd` calls `arrayMove` and dispatches `reorderCustomCharts` — ONLY in `onDragEnd`, never during drag.

**8 tests passing:**
- CUSTOM-03: chart strip renders with metric label, title matches catalog, registerChart called via load event mock
- CUSTOM-04: remove button visible, click dispatches removeCustomChart(id), re-render with empty store removes from DOM
- CUSTOM-05: DndContext wrapper present, drag-end dispatches reorderCustomCharts with correct arrayMove result

## Verification Results

```
TypeScript: npx tsc --noEmit → TYPE CHECK PASSED (0 errors)
Target 4-file suite: 15 tests pass (4 MetricSelector + 3 ChartTypePicker + 6 CustomChartSection + 2 CustomChartDnD)
Full suite: 90 tests pass, 20 test files, 0 failures, 0 regressions
```

## Deviations from Plan

**[Rule 1 - Bug] getAllByText instead of getByText for duplicate title elements**
- **Found during:** Task 2 test authoring
- **Issue:** ChartStrip renders the title in both the `StripHeader` (StripTitle) and inside `ChartStrip`'s own Typography — `getByText` throws "Found multiple elements"
- **Fix:** Tests use `getAllByText(...).length > 0` for title assertions; single-occurrence selectors use role-based queries (buttons) for specificity
- **Files modified:** CustomChartSection.test.tsx, CustomChartDnD.test.tsx

**[Rule 1 - Bug] "removed chart" test had dual-render artifact**
- **Found during:** Task 2
- **Issue:** Test created two `render()` calls with separate rerenders — the first render's DOM persisted alongside the second
- **Fix:** Single `render()` + `rerender()` pattern to test state transition

## Known Stubs

None. All components render real data from `useCustomChartMock`. The mock hook returns deterministic seeded data rather than live API data — this is intentional as the API contract is not yet available (documented in STATE.md open blockers).

## Self-Check: PASSED

**Files exist:**
- tail-history/src/components/AddChartDrawer/AddChartDrawer.tsx: FOUND
- tail-history/src/components/AddChartDrawer/ChartTypePicker.tsx: FOUND
- tail-history/src/pages/tailHistory/CustomChartSection.tsx: FOUND
- tail-history/src/__tests__/MetricSelector.test.tsx: FOUND (updated)
- tail-history/src/__tests__/ChartTypePicker.test.tsx: FOUND (updated)
- tail-history/src/__tests__/CustomChartSection.test.tsx: FOUND (updated)
- tail-history/src/__tests__/CustomChartDnD.test.tsx: FOUND (updated)

**Commits exist:**
- 53d968e: feat(05-02): build AddChartDrawer + ChartTypePicker with 7 passing tests
- 1d3b3a3: feat(05-02): build CustomChartSection with dnd-kit sortable and 8 passing tests
