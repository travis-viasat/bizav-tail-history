---
phase: 05-custom-chart-builder
slug: custom-chart-builder
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `tail-history/vite.config.ts` |
| **Quick run command** | `cd tail-history && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd tail-history && npx vitest run --coverage` |

---

## Wave 0 — Test Stubs Required Before Implementation

Each plan must include a Wave 0 task that writes failing test stubs FIRST. Implementation then makes them pass. This is the Nyquist gate.

### CUSTOM-01 (Metric Selector Panel)
```ts
// src/__tests__/MetricSelector.test.tsx
describe('MetricSelector (CUSTOM-01)', () => {
  it('renders "Add Chart" button visible on page', () => { /* stub */ });
  it('opens metric selector drawer on button click', () => { /* stub */ });
  it('renders all metric categories as list groups', () => { /* stub */ });
  it('filters metrics in real time as user types in search box', () => { /* stub */ });
});
```

### CUSTOM-02 (Chart Type Picker)
```ts
// src/__tests__/ChartTypePicker.test.tsx
describe('ChartTypePicker (CUSTOM-02)', () => {
  it('shows only compatible chart types for a time-series numeric metric', () => { /* stub */ });
  it('shows only bar type for a boolean/event metric', () => { /* stub */ });
  it('disables Add button until both metric and chart type are selected', () => { /* stub */ });
});
```

### CUSTOM-03 (Add and Render)
```ts
// src/__tests__/CustomChartSection.test.tsx
describe('CustomChartSection (CUSTOM-03)', () => {
  it('renders a new chart strip after metric is added via store', () => { /* stub */ });
  it('custom chart strip shows chart title matching metric name', () => { /* stub */ });
  it('custom chart registers with chart registry on mount', () => { /* stub */ });
});
```

### CUSTOM-04 (Remove Chart)
```ts
describe('CustomChartSection (CUSTOM-04)', () => {
  it('remove button is visible on each custom chart strip', () => { /* stub */ });
  it('clicking remove dispatches removeCustomChart to store', () => { /* stub */ });
  it('removed chart is no longer in the DOM', () => { /* stub */ });
});
```

### CUSTOM-05 (Drag to Reorder)
```ts
// src/__tests__/CustomChartDnD.test.tsx
describe('CustomChartDnD (CUSTOM-05)', () => {
  it('renders SortableContext wrapper around custom chart list', () => { /* stub */ });
  it('dispatches reorderCustomCharts to store after drag end', () => { /* stub */ });
});
```

---

## Automated Verify Commands

Run after each implementation task:

```bash
cd tail-history && npx vitest run --reporter=verbose
```

Build check after all tasks:

```bash
cd tail-history && npx tsc --noEmit && echo "TYPE CHECK PASSED"
```

---

## Browser Checkpoint (Wave 3 — 05-03)

Manual verification required before phase sign-off:

1. **Add Chart flow**: Click "Add Chart" button → drawer opens → search filters metrics → select metric → select chart type → click "Add" → chart appears on page below default charts
2. **Zoom sync**: Drag-zoom on any default chart → new custom chart also zooms
3. **Remove**: Click remove (X) on custom chart → chart disappears, no console errors
4. **Reorder**: Drag custom chart to new position → order updates without chart re-mounting (chart stays zoomed/in same state)
5. **Session persist**: Add 3 charts, scroll around — charts remain in correct order

---

## Requirements → Test Mapping

| Requirement | Test File | Test Count |
|-------------|-----------|------------|
| CUSTOM-01 | MetricSelector.test.tsx | 4 |
| CUSTOM-02 | ChartTypePicker.test.tsx | 3 |
| CUSTOM-03 | CustomChartSection.test.tsx | 3 |
| CUSTOM-04 | CustomChartSection.test.tsx | 3 |
| CUSTOM-05 | CustomChartDnD.test.tsx | 2 |

**Minimum test count for Nyquist compliance: 15 new tests**
