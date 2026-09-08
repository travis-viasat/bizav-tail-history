# Phase 5: Custom Chart Builder — Research

**Researched:** 2026-05-06
**Domain:** React drag-and-drop, MUI drawer/search UI, Highcharts dynamic chart lifecycle
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01: This is the primary workflow**
The user explicitly stated: "the focus is on allowing users to pick from metrics to build their custom charts." This is the #1 priority feature and the core value of the Tail History view. It must work well.

**D-02: Mock stubs, same as Phase 3**
Custom charts use the same mock hook pattern as default charts. Real API integration is deferred until backend contracts exist. Each metric mock returns a typed time-series stub.

**D-03: Metric list — all 80+ metrics**
The full metric list was provided during project initialization. The metric selector must show all of them, organized into categories, with real-time search filtering.

**D-04: Drag-to-reorder via dnd-kit**
CUSTOM-05 uses dnd-kit. Only custom charts are draggable — default charts stay fixed at top.

**D-05: Custom charts appear BELOW default charts**
The 8 default chart strips (Phase 3) remain fixed at the top. Custom charts stack below them. The user adds/removes/reorders within the custom section only.

**D-06: Chart type compatibility rules**
- Time-series numeric data → line, area, scatter
- Percentage/bounded data → line, area, bar
- Status/state data → bar, area (no scatter)
- Boolean/event data → bar only
- The UI shows only compatible types for the selected metric

**D-07: "Add Chart" trigger**
A prominent "Add Chart" button at the bottom of the chart stack opens the metric selector panel. The panel is a drawer or dialog — not inline.

**D-08: Session persistence only**
Custom chart order and selection persist for the current browser session via Zustand store (customCharts slice, already defined in Phase 1). No localStorage, no server persistence.

**D-09: Zoom sync integration**
Every custom chart must register with the chart registry (same pattern as default charts) so it participates in synchronized zoom. Use the same CHART_ID + makeSetExtremesHandler pattern.

**D-10: Deadline urgency**
Plans must be executable without unexpected blockers. Keep scope tight — CUSTOM-01 through CUSTOM-05 as written, nothing more.

### Claude's Discretion

Not explicitly stated in CONTEXT.md. All major decisions are locked above.

### Deferred Ideas (OUT OF SCOPE)

- Real backend API calls — mock stubs continue
- Playback crosshair sync on custom charts (Phase 4)
- Shareable URL encoding of custom chart config (Phase v2)
- Persistent config after page refresh (Phase v2)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CUSTOM-01 | "Add Chart" panel with searchable 80+ metric list, real-time search filtering | MUI Drawer + TextField + filtered List with ListSubheader grouping |
| CUSTOM-02 | Chart type picker — only compatible types shown per metric's data shape | MetricDefinition.compatibleChartTypes lookup map drives ToggleButtonGroup render |
| CUSTOM-03 | Custom chart renders on page, fetches mock data, participates in zoom sync | CustomChartStrip wraps ChartStrip; id from Zustand is registry key; useCustomChartMock(metricKey, chartType) |
| CUSTOM-04 | Remove custom chart — instance cleanup, no memory leak | ChartStrip's existing useEffect cleanup (unregisterChart) fires on unmount — no extra work |
| CUSTOM-05 | Drag-to-reorder custom charts, session-persistent via Zustand | dnd-kit NOT installed — must add; CSS.Transform avoids re-mount; reorderCustomCharts() already in store |
</phase_requirements>

---

## Summary

Phase 5 builds on a solid foundation. The Zustand store already has all five required actions (`addCustomChart`, `removeCustomChart`, `reorderCustomCharts`), the `ChartStrip` component already handles registry cleanup on unmount, and `useChartSync` already provides `makeSetExtremesHandler`. The work is pure additive UI — no store schema changes, no hook signature changes.

The two new runtime additions are: (1) **dnd-kit**, which is NOT currently installed and must be added, and (2) the **metric catalog + compatibility map**, which is a pure data/TypeScript concern with no library dependency. Everything else reuses existing patterns from Phases 1–3.

The most important implementation discipline for this phase is that drag-to-reorder must NOT cause chart components to re-mount. Re-mounting destroys and recreates the Highcharts instance, which breaks zoom sync and causes a visible flash. This is avoided by applying `CSS.Transform.toString(transform)` as an inline style rather than updating the React tree order during drag — the DOM reorder only happens in `onDragEnd` after the user releases.

**Primary recommendation:** Build in this order — metric catalog data file, TypeScript interfaces, AddChartDrawer, CustomChartStrip, dnd-kit sortable wrapper, integration into TailHistoryPage.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `zustand` | 5.0.13 | `customCharts` slice — add/remove/reorder | Already in package.json |
| `uuid` | 14.0.0 | `v4()` for stable chart IDs | Already in package.json |
| `@mui/material` | 6.5.0 | Drawer, TextField, List, ToggleButtonGroup | Already in package.json |
| `@mui/icons-material` | 6.5.0 | Close, DragHandle, Delete icons | Already in package.json |
| `@highcharts/react` | 4.2.1 | StockChart render | Already in package.json |
| `highcharts` | 12.6.0 | Chart engine | Already in package.json |

### Must Install
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@dnd-kit/core` | 6.3.1 | DnD context, sensors, collision detection | NOT in package.json — required for D-04 |
| `@dnd-kit/sortable` | 10.0.0 | `useSortable`, `SortableContext`, `arrayMove` | NOT in package.json — sortable preset |
| `@dnd-kit/utilities` | 3.2.2 | `CSS.Transform.toString()` | NOT in package.json — needed for transform style |

**Installation (from tail-history/ directory):**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Peer dependency check (verified via npm registry 2026-05-06):
- `@dnd-kit/core@6.3.1` requires `react >=16.8.0` — compatible with project's React 19.
- `@dnd-kit/sortable@10.0.0` requires `@dnd-kit/core ^6.3.0` — compatible.
- No TypeScript types packages needed — dnd-kit ships bundled TypeScript types.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@dnd-kit/sortable` | `react-beautiful-dnd` | RBD is unmaintained (no updates since 2022), doesn't support React 18+ strict mode properly. dnd-kit is the ecosystem successor. |
| `@dnd-kit/sortable` | HTML5 drag API | Native API has poor touch support, no animation, no collision detection. Not acceptable for production. |

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── pages/tailHistory/
│   ├── TailHistoryPage.tsx               # add CustomChartsSection below default charts
│   ├── tailHistoryStore.ts               # already complete — no changes needed
│   ├── charts/
│   │   └── CustomChart/
│   │       ├── CustomChartStrip.tsx      # wrapper: receives ChartDefinition, renders ChartStrip
│   │       └── useCustomChartMock.ts     # generic mock hook: (metricKey, chartType) → series
│   └── AddChartDrawer/
│       ├── AddChartDrawer.tsx            # MUI Drawer with search TextField + metric List
│       ├── MetricList.tsx                # filtered, grouped list of MetricDefinition items
│       ├── ChartTypePicker.tsx           # ToggleButtonGroup showing compatible types
│       └── metricCatalog.ts             # const array of MetricDefinition objects
├── hooks/
│   └── useChartSync.ts                   # already complete — no changes needed
└── utils/
    └── metricCompatibility.ts            # CHART_TYPE_COMPAT lookup map (pure data)
```

### Pattern 1: TypeScript Interfaces

The store already defines `ChartDefinition`. We extend that vocabulary with `MetricDefinition`:

```typescript
// Source: derived from CONTEXT.md metric catalog + D-06 compatibility rules

export type ChartType = 'line' | 'area' | 'bar' | 'scatter';

// Already in tailHistoryStore.ts — do NOT redefine:
// export interface ChartDefinition {
//   id: string;          // stable UUID — React key, registry key
//   metricId: string;
//   chartType: ChartType;
// }

/** Describes one metric entry in the catalog */
export interface MetricDefinition {
  /** Stable key used as metricId in ChartDefinition and as query key suffix */
  key: string;
  /** Display label shown in the metric selector list */
  label: string;
  /** Category for ListSubheader grouping */
  category: MetricCategory;
  /** Ordered list of chart types this metric supports (first = default) */
  compatibleChartTypes: ChartType[];
  /** Units label for y-axis (e.g. 'Mbps', '%', 'ms') */
  units?: string;
}

export type MetricCategory =
  | 'Connectivity & Availability'
  | 'CIR / MIR Throughput'
  | 'Bytes / Usage'
  | 'Signal Quality'
  | 'Latency & Packet Loss'
  | 'Errors & CRC'
  | 'Traffic & Application'
  | 'Antenna & Beam'
  | 'Terminal Status'
  | 'Events';
```

### Pattern 2: Compatibility Map (D-06)

```typescript
// Source: CONTEXT.md D-06 locked decision

/** Maps each data shape to its compatible chart types in preference order */
export const CHART_TYPE_COMPAT: Record<string, ChartType[]> = {
  timeseries_numeric:    ['line', 'area', 'scatter'],
  percentage_bounded:    ['line', 'area', 'bar'],
  status_state:          ['bar', 'area'],
  boolean_event:         ['bar'],
};
```

Each `MetricDefinition` in the catalog carries its pre-computed `compatibleChartTypes` array (derived from the above map at authoring time). The UI never calls the map at runtime — it reads from the definition directly. This makes the catalog self-contained and avoids an extra lookup layer.

### Pattern 3: dnd-kit Sortable — No Re-mount During Drag

The critical requirement from D-04 research: charts must NOT re-mount during drag. The mechanism is that `useSortable` returns a CSS `transform` (an `{x, y, scaleX, scaleY}` object), not a new array order. React renders the list in its original order; the item under the cursor visually moves via `CSS.Transform.toString(transform)` applied as an inline style. The DOM reorder only happens in `onDragEnd` when `reorderCustomCharts()` updates the Zustand array.

```typescript
// Source: dnd-kit official docs (dndkit.com/presets/sortable), verified 2026-05-06

// In TailHistoryPage or CustomChartsSection:
import {DndContext, closestCenter, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, verticalListSortingStrategy, arrayMove} from '@dnd-kit/sortable';

function handleDragEnd(event: DragEndEvent) {
  const {active, over} = event;
  if (over && active.id !== over.id) {
    const oldIndex = customCharts.findIndex(c => c.id === active.id);
    const newIndex = customCharts.findIndex(c => c.id === over.id);
    reorderCustomCharts(arrayMove(customCharts, oldIndex, newIndex));
  }
}

// Wrap the custom chart list:
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={customCharts.map(c => c.id)} strategy={verticalListSortingStrategy}>
    {customCharts.map(chart => (
      <SortableCustomChartStrip key={chart.id} chart={chart} ... />
    ))}
  </SortableContext>
</DndContext>
```

```typescript
// Inside SortableCustomChartStrip:
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: chart.id});

const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition,
};

return (
  <div ref={setNodeRef} style={style}>
    {/* Drag handle only — do NOT spread listeners onto the chart itself */}
    <DragHandleIcon {...attributes} {...listeners} />
    <CustomChartStrip chart={chart} ... />
  </div>
);
```

**Critical detail:** Spread `listeners` only on the drag handle element, NOT on the chart container. Spreading on the chart container intercepts mouse events on the chart, breaking Highcharts zoom selection.

### Pattern 4: Custom Chart Rendering (CUSTOM-03)

Each custom chart uses a stable UUID from the Zustand store as its `chartId`. The `makeSetExtremesHandler` factory in `useChartSync` is called once per chart ID and the result memoized. Since the chart list is dynamic, use `useMemo` with the chart's `id` as a dependency — or, simpler, wrap in a child component that calls `makeSetExtremesHandler` at mount time.

```typescript
// Source: derived from existing TailHistoryPage pattern

// In CustomChartStrip (receives ChartDefinition as prop):
const onSetExtremes = useMemo(
  () => makeSetExtremesHandler(chart.id),
  [makeSetExtremesHandler, chart.id]
);

return (
  <ChartStrip
    chartId={chart.id}         // stable UUID from Zustand — same as registry key
    title={metricDef.label}
    series={series}
    registerChart={registerChart}
    unregisterChart={unregisterChart}
    onSetExtremes={onSetExtremes}
    height={200}
  />
);
```

`ChartStrip` already calls `unregisterChart(chartId)` in its `useEffect` cleanup. No extra cleanup code needed for CUSTOM-04 — removing the chart from Zustand causes React to unmount `CustomChartStrip`, which triggers the existing cleanup.

### Pattern 5: Generic Mock Hook

Rather than 80+ individual mock hooks, use a single generic hook parameterized by `metricKey` and `chartType`:

```typescript
// useCustomChartMock.ts

export function useCustomChartMock(
  metricKey: string,
  chartType: ChartType
): {series: Highcharts.SeriesOptionsType[]; isLoading: boolean; isEmpty: boolean; error: Error | null} {

  // Derive a numeric seed from metricKey so each metric gets distinct data
  const seed = metricKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const series: Highcharts.SeriesOptionsType[] = useMemo(() => {
    return [{
      type: chartType as any,
      name: metricKey,
      data: generateMockSeries(seed, 0, 100),  // reuse existing utility
    }];
  }, [metricKey, chartType, seed]);

  return {series, isLoading: false, isEmpty: false, error: null};
}
```

The `generateMockSeries` utility already exists in `src/pages/tailHistory/__mocks__/chartData.ts` and takes `(seed, min, max)` — directly reusable. Different metric keys produce different seeds and therefore visually distinct data without any backend call.

### Pattern 6: AddChartDrawer UI

```typescript
// AddChartDrawer.tsx — MUI Drawer (not Dialog) from right side

<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{sx: {width: 400}}}>
  <Box sx={{p: 2}}>
    <TextField
      fullWidth
      placeholder="Search metrics..."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      InputProps={{startAdornment: <SearchIcon />}}
    />
  </Box>
  <List dense>
    {GROUPED_METRICS.map(({category, metrics}) => {
      const filtered = metrics.filter(m =>
        m.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length === 0) return null;
      return (
        <React.Fragment key={category}>
          <ListSubheader>{category}</ListSubheader>
          {filtered.map(metric => (
            <ListItemButton key={metric.key} onClick={() => setSelectedMetric(metric)}>
              <ListItemText primary={metric.label} />
            </ListItemButton>
          ))}
        </React.Fragment>
      );
    })}
  </List>
  {selectedMetric && (
    <ChartTypePicker
      metric={selectedMetric}
      selectedType={selectedChartType}
      onSelect={setSelectedChartType}
    />
  )}
  <Button onClick={handleAdd} disabled={!selectedMetric}>Add Chart</Button>
</Drawer>
```

### Anti-Patterns to Avoid

- **Re-ordering the React tree during drag:** Do NOT update the Zustand array inside `onDragOver` or `onDragMove`. Only update in `onDragEnd`. Updating during drag causes React to re-render, which re-mounts chart components and destroys the Highcharts instance.
- **Generating new CHART_IDs on re-render:** `v4()` inside a component body (not inside a `useMemo` or `useRef`) generates a new UUID on every render. The ID must be stable for the life of the chart. For custom charts, the ID comes from the Zustand store (set at `addCustomChart` time) and is stable. Never call `uuidv4()` at render time for custom charts.
- **Spreading dnd-kit listeners onto the chart container:** This intercepts Highcharts mouse events and breaks drag-zoom. Use a drag handle icon element only.
- **Using Dialog instead of Drawer:** A Dialog blocks the entire page. Users cannot refer to the existing charts while selecting a new one. Drawer keeps the page visible behind it.
- **Virtualization overkill:** 80 metrics is small enough for a standard MUI List — react-window is NOT needed. A filtered `Array.filter()` on each keystroke is fine at this count.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-to-reorder | Custom drag event handlers | `@dnd-kit/sortable` + `useSortable` | Collision detection, touch support, keyboard accessibility, and CSS transform positioning are non-trivial to implement correctly |
| Array reorder after drag | Manual splice | `arrayMove` from `@dnd-kit/sortable` | Handles edge cases (drop on self, out-of-bounds) |
| Mock time-series data | New per-metric generator | `generateMockSeries(seed, min, max)` from `chartData.ts` | Already exists, deterministic, 4032 points across 14 days |
| Chart instance cleanup | Manual `chart.destroy()` call | `ChartStrip`'s existing `useEffect` cleanup | Already calls `unregisterChart(chartId)` on unmount; Highcharts handles `.destroy()` internally via the `@highcharts/react` wrapper |

**Key insight:** ChartStrip's existing `useEffect` cleanup pattern (`return () => unregisterChart(chartId)`) automatically handles CUSTOM-04. Removing a chart from the Zustand array causes React to unmount the corresponding `CustomChartStrip`, which triggers the `useEffect` cleanup, which calls `unregisterChart`, which removes the chart from the registry. There is no memory leak path.

---

## Common Pitfalls

### Pitfall 1: Chart Re-mounts During Drag
**What goes wrong:** User drags a chart to reorder; the chart flashes or resets its zoom.
**Why it happens:** Developer updates the Zustand `customCharts` array inside `onDragMove` or `onDragOver`, causing React to reorder the DOM. Highcharts chart instances are tied to specific DOM nodes — when the node is removed and re-created, `chart.load` fires again, the instance is replaced in the registry, and any active zoom is lost.
**How to avoid:** Only call `reorderCustomCharts(arrayMove(...))` inside `onDragEnd`. During the drag, the visual position is entirely controlled by `CSS.Transform.toString(transform)` applied as an inline style — React does NOT reorder the list.
**Warning signs:** Charts re-registering during drag (add a `console.log` to `registerChart`), or Highcharts `chart.events.load` firing unexpectedly.

### Pitfall 2: Unstable Chart IDs
**What goes wrong:** Zoom sync breaks; charts appear to multiply in the registry.
**Why it happens:** `v4()` called at component render time (not in `useMemo`/`useRef`) generates a new UUID on every render. The old ID stays in the registry pointing to a stale instance while the new ID registers a new instance — the registry grows unbounded.
**How to avoid:** For custom charts, the UUID is generated exactly once inside `addCustomChart` in the Zustand action: `{id: v4(), metricId, chartType}`. The component receives `chart.id` as a prop — it never calls `v4()` itself.
**Warning signs:** Registry size grows larger than the number of charts visible on the page.

### Pitfall 3: dnd-kit Listeners Blocking Highcharts Zoom
**What goes wrong:** User tries to drag-zoom a chart; instead, the entire chart strip begins dragging.
**Why it happens:** `listeners` (from `useSortable`) includes `onMouseDown`. If spread onto the chart container div, Highcharts never receives the mousedown event that initiates its own zoom selection.
**How to avoid:** Render a dedicated drag handle element (e.g., MUI `DragIndicator` icon) and spread `{...attributes} {...listeners}` ONLY on that element. Set `cursor: 'grab'` on the handle via Emotion `styled`.
**Warning signs:** Highcharts zoom does not initiate when clicking inside the chart area.

### Pitfall 4: Search Not Debounced on Controlled Input
**What goes wrong:** Typing in the search field feels laggy with 80 items.
**Why it happens:** With 80 items and instant filtering, each keystroke synchronously re-renders the list.
**How to avoid:** At 80 items, `Array.filter()` is imperceptibly fast — debouncing is NOT needed and would actually feel slower (adds artificial delay). Use a simple controlled `useState` + filter on every render. Only add debouncing if metrics exceed ~500 items.
**Warning signs:** This pitfall goes the wrong direction — developers add unnecessary debouncing that makes search feel sluggish. Keep it simple.

### Pitfall 5: Default Chart Type Not Respecting Compatibility
**What goes wrong:** User adds a metric; the chart type selected by default is not in `compatibleChartTypes`.
**Why it happens:** Developer hardcodes `'line'` as the default type without checking the metric's compatibility list.
**How to avoid:** In `handleAdd`, set `chartType: selectedChartType ?? selectedMetric.compatibleChartTypes[0]`. The first entry in `compatibleChartTypes` is always the best default (established by convention in the metric catalog).
**Warning signs:** Metrics with `boolean_event` data shape (compatible only with `bar`) appearing as line charts showing nonsensical data.

---

## Code Examples

### Adding a Custom Chart (Zustand action already available)

```typescript
// Source: tailHistoryStore.ts (already implemented)
addCustomChart({
  id: v4(),                    // generate here, not in the component
  metricId: selectedMetric.key,
  chartType: selectedChartType ?? selectedMetric.compatibleChartTypes[0]
});
```

### Reorder on Drag End (from Zustand store + dnd-kit)

```typescript
// Source: dnd-kit docs + tailHistoryStore.ts reorderCustomCharts action
import {arrayMove} from '@dnd-kit/sortable';
import type {DragEndEvent} from '@dnd-kit/core';

function handleDragEnd(event: DragEndEvent) {
  const {active, over} = event;
  if (!over || active.id === over.id) return;
  const oldIndex = customCharts.findIndex(c => c.id === active.id);
  const newIndex = customCharts.findIndex(c => c.id === over.id);
  reorderCustomCharts(arrayMove(customCharts, oldIndex, newIndex));
}
```

### Applying Transform Without Re-mount

```typescript
// Source: dnd-kit official docs (dndkit.com/presets/sortable)
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: chart.id});

// This is a pure CSS visual repositioning — no React tree change during drag
const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition,
};
```

### ChartStrip Cleanup — Already Handled

```typescript
// Source: ChartStrip.tsx (already implemented)
// No code change needed for CUSTOM-04 — this already fires on unmount:
useEffect(() => {
  return () => {
    unregisterChart(chartId);
  };
}, [chartId, unregisterChart]);
```

### Metric Catalog Entry Pattern

```typescript
// Source: derived from CONTEXT.md metrics_catalog + D-06

// metricCatalog.ts (new file to create)
export const METRIC_CATALOG: MetricDefinition[] = [
  // Connectivity & Availability
  {key: 'connectivity_status',   label: 'Connectivity Status',   category: 'Connectivity & Availability', compatibleChartTypes: ['bar', 'area'],          units: undefined},
  {key: 'service_availability',  label: 'Service Availability',  category: 'Connectivity & Availability', compatibleChartTypes: ['line', 'area', 'bar'],   units: '%'},
  {key: 'iqe_score',             label: 'iQe Score',             category: 'Connectivity & Availability', compatibleChartTypes: ['line', 'area'],          units: 'score'},
  // CIR / MIR Throughput
  {key: 'upstream_cir',          label: 'Upstream CIR',          category: 'CIR / MIR Throughput',        compatibleChartTypes: ['line', 'area', 'scatter'], units: 'Mbps'},
  {key: 'downstream_cir',        label: 'Downstream CIR',        category: 'CIR / MIR Throughput',        compatibleChartTypes: ['line', 'area', 'scatter'], units: 'Mbps'},
  // ... all 80+ entries follow same pattern
];
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-beautiful-dnd` | `@dnd-kit/sortable` | 2022–2023 | RBD is unmaintained; dnd-kit is the community successor with React 18+ strict mode support |
| Per-metric mock files (one per chart) | Single `useCustomChartMock(metricKey, chartType)` | — | Generic parameterized mock is the correct pattern for 80+ metrics; per-metric files don't scale |

---

## Open Questions

1. **Metric catalog completeness**
   - What we know: 80+ metric labels and categories are documented in CONTEXT.md.
   - What's unclear: Each metric needs a `key` (machine-readable ID for query keys) and a data shape classification. The CONTEXT.md provides labels, not keys.
   - Recommendation: Define keys as `snake_case` of the label (e.g., `"Upstream CIR"` → `"upstream_cir"`). This is reversible — when the real backend API is connected, keys become API field names. Use snake_case now as a safe default.

2. **Color assignment for custom chart series**
   - What we know: `colors.ts` has named constants; CLAUDE.md prohibits hardcoded hex.
   - What's unclear: There is no pre-defined color rotation for arbitrarily-ordered custom charts.
   - Recommendation: Create a `CUSTOM_CHART_COLORS` array in `colors.ts` (6–8 named entries cycling through existing palette). Use `seed % CUSTOM_CHART_COLORS.length` to assign a color per metric key deterministically.

3. **Remove button placement**
   - What we know: CUSTOM-04 requires a remove affordance; no Figma spec shown for this.
   - What's unclear: Top-right X icon? Drag handle area tooltip? Separate context menu?
   - Recommendation: Small `IconButton` with `CloseIcon` in the top-right corner of each `CustomChartStrip` header row, matching the "X to dismiss" convention. Keep it simple — Figma spec can drive refinement later.

---

## Environment Availability

Step 2.6: SKIPPED for most dependencies (already confirmed installed). Only new dependency is dnd-kit.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@dnd-kit/core` | CUSTOM-05 | No | — | None — must install |
| `@dnd-kit/sortable` | CUSTOM-05 | No | — | None — must install |
| `@dnd-kit/utilities` | CUSTOM-05 | No | — | None — must install |
| `uuid` | custom chart ID generation | Yes | 14.0.0 | — |
| `@mui/material` | Drawer, TextField, List | Yes | 6.5.0 | — |
| `@mui/icons-material` | DragIndicator, Close | Yes | 6.5.0 | — |

**Missing dependencies with no fallback:**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — Wave 0 must install these before any CUSTOM-05 work.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 + @testing-library/react 16.3.2 |
| Config file | vite.config.ts (embedded `test:` block) |
| Quick run command | `npm run test -- --reporter=verbose` (from `tail-history/`) |
| Full suite command | `npm run test -- --reporter=verbose --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CUSTOM-01 | AddChartDrawer renders metric list, search filters results | unit | `npx vitest run src/__tests__/AddChartDrawer.test.tsx` | Wave 0 |
| CUSTOM-01 | Search clears → full list reappears | unit | same file | Wave 0 |
| CUSTOM-02 | ChartTypePicker shows only compatible types for metric | unit | `npx vitest run src/__tests__/ChartTypePicker.test.tsx` | Wave 0 |
| CUSTOM-02 | Incompatible types absent from ToggleButtonGroup | unit | same file | Wave 0 |
| CUSTOM-03 | CustomChartStrip renders mock chart title | unit | `npx vitest run src/__tests__/CustomChartStrip.test.tsx` | Wave 0 |
| CUSTOM-03 | registerChart called with chart.id on mount | unit | same file | Wave 0 |
| CUSTOM-04 | unregisterChart called on unmount | unit | `npx vitest run src/__tests__/CustomChartStrip.test.tsx` | Wave 0 |
| CUSTOM-05 | reorderCustomCharts called with arrayMove result in onDragEnd | unit | `npx vitest run src/__tests__/CustomChartsSection.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test -- --reporter=dot`
- **Per wave merge:** `npm run test -- --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/AddChartDrawer.test.tsx` — covers CUSTOM-01
- [ ] `src/__tests__/ChartTypePicker.test.tsx` — covers CUSTOM-02
- [ ] `src/__tests__/CustomChartStrip.test.tsx` — covers CUSTOM-03 + CUSTOM-04
- [ ] `src/__tests__/CustomChartsSection.test.tsx` — covers CUSTOM-05
- [ ] Framework install: `cd tail-history && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

---

## Sources

### Primary (HIGH confidence)
- dnd-kit official docs (dndkit.com/presets/sortable) — useSortable hook API, transform/transition pattern, arrayMove, SortableContext. Verified 2026-05-06.
- npm registry (`npm view @dnd-kit/core version`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) — confirmed versions 6.3.1, 10.0.0, 3.2.2. Verified 2026-05-06.
- `tail-history/package.json` — confirmed dnd-kit NOT installed; confirmed uuid, MUI 6.5.0, @highcharts/react 4.2.1, vitest 4.1.5 all installed.
- `tailHistoryStore.ts` — confirmed `addCustomChart`, `removeCustomChart`, `reorderCustomCharts` and `ChartDefinition` interface all already implemented.
- `ChartStrip.tsx` — confirmed `useEffect` cleanup calling `unregisterChart(chartId)` already implemented.
- `useChartSync.ts` — confirmed `makeSetExtremesHandler(chartId)` factory pattern.
- `CirFulfillment.tsx` + `useCirFulfillmentMock.ts` — confirmed chart wrapper pattern and `generateMockSeries` utility availability.

### Secondary (MEDIUM confidence)
- CONTEXT.md D-06 — chart type compatibility rules. Source: user decision, not independently validated against data contracts. Sufficient for mock phase.
- CONTEXT.md metrics_catalog — 80+ metric labels and categories. Source: user-provided. Key assignments (snake_case) are researcher inference.

---

## Metadata

**Confidence breakdown:**
- dnd-kit installation and API: HIGH — npm registry + official docs verified same day
- Chart re-mount avoidance via CSS.Transform: HIGH — official dnd-kit docs explicitly document this pattern
- ChartStrip cleanup handling CUSTOM-04: HIGH — code verified directly in ChartStrip.tsx
- Metric catalog TypeScript interfaces: HIGH — derived directly from locked decisions and existing store types
- Mock hook architecture (generic): HIGH — `generateMockSeries` utility confirmed to exist and take seed param
- Drawer vs Dialog decision: HIGH — rationale is UX-deterministic (non-blocking overlay)

**Research date:** 2026-05-06
**Valid until:** 2026-06-06 (dnd-kit 6.x/10.x are stable; MUI 6.x is pinned by platform)
