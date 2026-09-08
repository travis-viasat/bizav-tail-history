---
phase: 05-custom-chart-builder
plan: "01"
subsystem: custom-chart-infrastructure
tags:
  - dnd-kit
  - metric-catalog
  - mock-hook
  - test-stubs
  - colors
dependency_graph:
  requires:
    - tail-history/src/pages/tailHistory/__mocks__/chartData.ts
    - tail-history/src/theme/colors.ts
  provides:
    - tail-history/src/catalog/metricCatalog.ts
    - tail-history/src/pages/tailHistory/charts/CustomChart/useCustomChartMock.ts
    - tail-history/src/__tests__/MetricSelector.test.tsx
    - tail-history/src/__tests__/ChartTypePicker.test.tsx
    - tail-history/src/__tests__/CustomChartSection.test.tsx
    - tail-history/src/__tests__/CustomChartDnD.test.tsx
  affects:
    - Wave 2 component implementations (MetricSelector, ChartTypePicker, CustomChartSection, CustomChartDnD)
tech_stack:
  added:
    - "@dnd-kit/core@6.3.1"
    - "@dnd-kit/sortable@10.0.0"
    - "@dnd-kit/utilities@3.2.2"
  patterns:
    - Deterministic seed-based mock data via generateMockSeries(seed, min, max)
    - METRIC_CATALOG_BY_CATEGORY for grouped drawer UI rendering
    - D-06 compatibility rules: status→bar/area, event→bar, pct→line/area/bar, numeric→line/area/scatter
key_files:
  created:
    - tail-history/src/catalog/metricCatalog.ts
    - tail-history/src/pages/tailHistory/charts/CustomChart/useCustomChartMock.ts
    - tail-history/src/__tests__/MetricSelector.test.tsx
    - tail-history/src/__tests__/ChartTypePicker.test.tsx
    - tail-history/src/__tests__/CustomChartSection.test.tsx
    - tail-history/src/__tests__/CustomChartDnD.test.tsx
  modified:
    - tail-history/src/theme/colors.ts
    - tail-history/package.json
    - tail-history/package-lock.json
decisions:
  - dnd-kit v6.3.1/v10.0.0/v3.2.2 pinned at exact versions from CONTEXT.md to avoid API drift
  - CUSTOM_CHART_COLORS cycles 6 existing named constants (no new hex values per CLAUDE.md)
  - MetricCategory union type (not enum) for TypeScript verbatimModuleSyntax compatibility
  - METRIC_CATALOG_BY_CATEGORY as reduce() over METRIC_CATALOG — single source of truth
  - useCustomChartMock uses useMemo with seed/color in deps array for stable referential identity
metrics:
  duration_minutes: 7
  completed_date: "2026-05-06"
  tasks_completed: 2
  tasks_total: 2
  files_created: 6
  files_modified: 3
---

# Phase 05 Plan 01: Custom Chart Builder Infrastructure Summary

**One-liner:** dnd-kit installed, 97-entry metric catalog with D-06 compatibility rules, useCustomChartMock hook with deterministic seeding, CUSTOM_CHART_COLORS palette, and 15 Wave 0 test stubs guiding Wave 2 implementations.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write all 4 failing test stubs | 0b63cf1 | 4 new test stub files |
| 2 | Install dnd-kit + create METRIC_CATALOG + colors + mock hook | 7009783 | package.json, colors.ts, metricCatalog.ts, useCustomChartMock.ts |

## What Was Built

### Task 1: Wave 0 Test Stubs
Four test stub files created with `it.todo()` stubs — not accidental omissions but explicit intent markers for Wave 2 implementations:
- `MetricSelector.test.tsx` — 4 stubs (CUSTOM-01): Add Chart button, drawer open, category groups, search filtering
- `ChartTypePicker.test.tsx` — 3 stubs (CUSTOM-02): compatible chart types per metric, boolean/event restriction, Add button guard
- `CustomChartSection.test.tsx` — 6 stubs (CUSTOM-03 + CUSTOM-04): chart strip rendering, title, registry, remove button, dispatch, DOM removal
- `CustomChartDnD.test.tsx` — 2 stubs (CUSTOM-05): SortableContext wrapper, reorder dispatch

Vitest reports: 15 todo (pending), 0 failures, 0 passes — correct Wave 0 state.

### Task 2: Infrastructure Files

**dnd-kit installation:** Three packages installed at exact pinned versions from CONTEXT.md.

**CUSTOM_CHART_COLORS (colors.ts):** 6-entry array cycling PRIMARY_PURPLE, BOLD_BLUE, SUCCESS_GREEN, WARNING_AMBER, ERROR_RED, GREY — all existing named constants, no new hex literals.

**metricCatalog.ts (97 entries):** Exports `ChartType`, `MetricCategory`, `MetricDefinition`, `METRIC_CATALOG` (97 entries across 10 categories), and `METRIC_CATALOG_BY_CATEGORY` for grouped drawer rendering. D-06 compatibility rules applied via shared constant arrays (STATUS_STATE, BOOLEAN_EVENT, PERCENTAGE, NUMERIC).

**useCustomChartMock.ts:** Generic mock hook. Seed derived from `metricKey.charCodeAt` sum — each metric gets visually distinct LCG-based data. Color assigned deterministically via `seed % CUSTOM_CHART_COLORS.length`. Returns `{series, isLoading: false, isEmpty: false, error: null}` matching the shape used by all existing chart-specific mock hooks.

## Verification Results

```
TypeScript: npx tsc --noEmit → TYPE CHECK PASSED (0 errors)
Vitest: 15 todo (pending), 0 failures, 4 test files skipped (correct Wave 0 state)
Metric count: 97 entries covering all 10 categories (>= 80 required)
dnd-kit packages: @dnd-kit/core@6.3.1, @dnd-kit/sortable@10.0.0, @dnd-kit/utilities@3.2.2
```

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

**Files exist:**
- tail-history/src/catalog/metricCatalog.ts: FOUND
- tail-history/src/pages/tailHistory/charts/CustomChart/useCustomChartMock.ts: FOUND
- tail-history/src/__tests__/MetricSelector.test.tsx: FOUND
- tail-history/src/__tests__/ChartTypePicker.test.tsx: FOUND
- tail-history/src/__tests__/CustomChartSection.test.tsx: FOUND
- tail-history/src/__tests__/CustomChartDnD.test.tsx: FOUND

**Commits exist:**
- 0b63cf1: test(05-01): add Wave 0 failing test stubs for custom chart builder — FOUND
- 7009783: feat(05-01): install dnd-kit, create metric catalog, colors, and mock hook — FOUND
