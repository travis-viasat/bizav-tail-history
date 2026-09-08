---
phase: quick
plan: 260514-hzg
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/AddChartDrawer/ChartTypePicker.tsx
  - src/__tests__/ChartTypePicker.test.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "ChartTypePicker renders Beam SegmentedControl instead of MUI ToggleButtonGroup"
    - "Selecting a chart type still calls onSelect with the correct ChartType value"
    - "Parent-driven selectedType changes are reflected in the SegmentedControl selection"
    - "Incompatible-metrics warning message still renders when no chart types match"
    - "All existing tests pass after the swap"
  artifacts:
    - path: "src/components/AddChartDrawer/ChartTypePicker.tsx"
      provides: "Chart type picker using Beam SegmentedControl"
      contains: "SegmentedControl"
    - path: "src/__tests__/ChartTypePicker.test.tsx"
      provides: "Updated tests for Beam-based ChartTypePicker"
  key_links:
    - from: "src/components/AddChartDrawer/ChartTypePicker.tsx"
      to: "@viasat/beam-react"
      via: "import {SegmentedControl}"
      pattern: "SegmentedControl"
    - from: "src/components/AddChartDrawer/ChartTypePicker.tsx"
      to: "src/components/AddChartDrawer/AddChartDrawer.tsx"
      via: "ChartTypePicker props (unchanged interface)"
      pattern: "ChartTypePickerProps"
---

<objective>
Replace ChartTypePicker's MUI ToggleButtonGroup + ToggleButton with Beam's SegmentedControl component, keeping the same props interface and behavior.

Purpose: Align with Viasat's Beam design system for consistent UI across Insights.
Output: Updated ChartTypePicker.tsx using Beam SegmentedControl, passing all existing tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/AddChartDrawer/ChartTypePicker.tsx
@src/__tests__/ChartTypePicker.test.tsx

<interfaces>
<!-- Beam SegmentedControl API (from @viasat/beam-react v2.29.0) -->

```typescript
import {SegmentedControl} from '@viasat/beam-react';

// SegmentedControl props:
//   disabled?: boolean
//   size?: 'sm' | 'md' | 'lg'
//   onChange?: (value: string) => void      // NOTE: value is string, not ChartType
//   initialSelection?: string               // Uncontrolled — no `value` prop
//   fluid?: boolean
//   children?: ReactNode

// SegmentedControl.List — wraps items
// SegmentedControl.Item — extends ComponentPropsWithoutRef<'button'>
//   value: string (required)
//   children?: ReactNode (label text)
//   disabled?: boolean
//   icon?: ReactNode
//   aria-label?: string

// SegmentedControl.Item renders an actual <button> element in the DOM.
// Existing test queries using getByRole('button', {name: /line/i}) WILL STILL WORK.
```

<!-- ChartTypePicker props interface (UNCHANGED — do not modify) -->

```typescript
export interface ChartTypePickerProps {
  metrics: MetricDefinition[];
  selectedType: ChartType | null;
  onSelect: (type: ChartType) => void;
}
```

<!-- ChartType from metricCatalog (for reference) -->

```typescript
type ChartType = 'line' | 'area' | 'bar' | 'scatter';
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Swap MUI ToggleButtonGroup for Beam SegmentedControl in ChartTypePicker</name>
  <files>src/components/AddChartDrawer/ChartTypePicker.tsx</files>
  <action>
Replace the MUI ToggleButtonGroup/ToggleButton implementation with Beam SegmentedControl. Specific changes:

1. **Imports**: Remove `ToggleButtonGroup` and `ToggleButton` from `@mui/material`. Add `import {SegmentedControl} from '@viasat/beam-react'`. Keep `Box` and `Typography` from `@mui/material` (used for PickerContainer and labels). Keep `styled` from `@mui/material/styles`.

2. **Controlled-to-uncontrolled bridge**: Beam SegmentedControl is uncontrolled (uses `initialSelection`, no `value` prop). The parent passes `selectedType` as a controlled prop. To keep them in sync, add a `key` prop to the `SegmentedControl` component: `key={selectedType ?? 'none'}`. This forces React to remount the SegmentedControl whenever `selectedType` changes externally, reinitializing it with the correct `initialSelection`.

3. **onChange handler**: Replace the MUI handler signature `(_event: React.MouseEvent<HTMLElement>, value: ChartType | null)` with Beam's `(value: string) => void`. The new handler should cast the string to ChartType and call `onSelect`: `const handleChange = (value: string) => { onSelect(value as ChartType); }`. No null guard needed — Beam always provides a value on change.

4. **JSX replacement**: Replace:
   ```
   <ToggleButtonGroup exclusive value={selectedType} onChange={handleChange} size="small" aria-label="chart type">
     {compatibleTypes.map(type => (
       <ToggleButton key={type} value={type} aria-label={type}>
         {CHART_TYPE_LABELS[type]}
       </ToggleButton>
     ))}
   </ToggleButtonGroup>
   ```
   With:
   ```
   <SegmentedControl
     key={selectedType ?? 'none'}
     initialSelection={selectedType ?? undefined}
     onChange={handleChange}
     size="sm"
     fluid
   >
     <SegmentedControl.List>
       {compatibleTypes.map(type => (
         <SegmentedControl.Item key={type} value={type} aria-label={type}>
           {CHART_TYPE_LABELS[type]}
         </SegmentedControl.Item>
       ))}
     </SegmentedControl.List>
   </SegmentedControl>
   ```

5. **Size mapping**: MUI `size="small"` maps to Beam `size="sm"`.

6. **fluid prop**: Add `fluid` so the segments fill the available width evenly, matching the original toggle button group behavior.

7. Keep the `ChartTypePickerProps` interface, `PickerContainer`, `CHART_TYPE_LABELS`, `ALL_CHART_TYPES`, `getCompatibleTypes`, and the empty-state warning branch completely unchanged.

8. Keep the Viasat copyright header unchanged.
  </action>
  <verify>
    <automated>npx vitest run src/__tests__/ChartTypePicker.test.tsx --reporter=verbose</automated>
  </verify>
  <done>
    - ChartTypePicker imports SegmentedControl from @viasat/beam-react, not ToggleButtonGroup from @mui/material
    - No MUI toggle-related imports remain in ChartTypePicker.tsx
    - Component renders SegmentedControl > SegmentedControl.List > SegmentedControl.Item structure
    - Props interface (ChartTypePickerProps) is unchanged
    - All 3 existing tests pass without modification (SegmentedControl.Item renders as button elements)
  </done>
</task>

<task type="auto">
  <name>Task 2: Verify tests pass and fix if needed</name>
  <files>src/__tests__/ChartTypePicker.test.tsx</files>
  <action>
Run the full test suite for ChartTypePicker. The tests use `getByRole('button', {name: /line/i})` queries, which should still work because Beam's SegmentedControl.Item renders actual `<button>` elements.

If all 3 tests pass: No changes needed to the test file. Done.

If any test fails due to the Beam swap, diagnose and fix:

- **Role query failures**: If SegmentedControl items are not found by `getByRole('button')`, update queries to match the actual rendered role (check DOM output with `screen.debug()`).

- **Click handling failures**: If `fireEvent.click` does not trigger the onChange callback, try `fireEvent.click` on the button directly (should work since items are `<button>` elements). If still failing, use `userEvent.click` from `@testing-library/user-event` instead.

- **Third test (AddChartDrawer integration)**: This test renders the full AddChartDrawer, clicks "Latency", and checks the Add button becomes enabled. The chart type auto-selection logic is in AddChartDrawer, not ChartTypePicker, so this should still work. If it fails, check that the auto-selected chart type is correctly passed as `initialSelection` to the SegmentedControl.

Do NOT change test semantics — only update DOM queries if the rendered structure changed.
  </action>
  <verify>
    <automated>npx vitest run src/__tests__/ChartTypePicker.test.tsx --reporter=verbose</automated>
  </verify>
  <done>
    - All 3 ChartTypePicker tests pass
    - No test regressions in the broader suite: `npx vitest run --reporter=verbose` shows no new failures
  </done>
</task>

</tasks>

<verification>
1. `npx vitest run src/__tests__/ChartTypePicker.test.tsx --reporter=verbose` — all 3 tests pass
2. `npx tsc --noEmit` — no TypeScript errors
3. `grep -c 'ToggleButton' src/components/AddChartDrawer/ChartTypePicker.tsx` returns 0 (no MUI toggle imports remain)
4. `grep -c 'SegmentedControl' src/components/AddChartDrawer/ChartTypePicker.tsx` returns a positive number
</verification>

<success_criteria>
- ChartTypePicker uses Beam SegmentedControl exclusively (zero MUI toggle references)
- Props interface unchanged — no impact on AddChartDrawer or other consumers
- All 3 existing tests pass
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/260514-hzg-swap-charttypepicker-s-mui-togglebuttong/260514-hzg-SUMMARY.md`
</output>
