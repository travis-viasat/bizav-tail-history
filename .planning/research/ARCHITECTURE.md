# Architecture Patterns: Tail History View

**Domain:** React + HighCharts analytics dashboard with synchronized zoom, playback timeline, and dynamic chart builder
**Researched:** 2026-05-04
**Overall confidence:** HIGH (core HighCharts sync pattern is well-documented; React integration patterns drawn from official sources and confirmed Insights ecosystem constraints)

---

## Recommended Architecture

The system has four primary concern layers: data fetching, global shared state, chart coordination, and rendering. The critical architectural insight is that HighCharts chart instances cannot be stored in React state — they are mutable objects that live outside the React rendering cycle. Chart instance coordination must happen through refs and a dedicated registry pattern.

```
┌─────────────────────────────────────────────────────────────┐
│                        Page Layer                           │
│   TailHistoryPage — query param parsing, layout shell       │
└───────────┬─────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────┐
│                    Feature Component Layer                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  FlightMap   │  │ PlaybackBar  │  │  ChartPanel      │  │
│  │  Component   │  │  Component   │  │  (host for all   │  │
│  └──────┬───────┘  └──────┬───────┘  │   chart strips)  │  │
│         │                 │          └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼────────────┘
          │                 │                   │
┌─────────▼─────────────────▼───────────────────▼────────────┐
│                    Zustand View Store                        │
│  (useTailHistoryStore — createViewStore() per ecosystem)    │
│                                                             │
│  timeRange: { start, end }        ← date picker / API      │
│  zoomedRange: { min, max } | null ← chart zoom / playback  │
│  playhead: number (epoch ms)      ← scrubber position       │
│  playback: { active, speed }      ← play/pause/speed        │
│  customCharts: ChartDefinition[]  ← ordered chart list      │
│  metricLibrary: MetricDef[]       ← loaded once on mount    │
└─────────────────────────────────────────────────────────────┘
          │
┌─────────▼────────────────────────────────────────────────┐
│              Chart Instance Registry (ref, not state)     │
│  chartRegistryRef: Map<chartId, Highcharts.Chart>         │
│  Owned by ChartPanel, passed via callback props           │
└──────────────────────────────────────────────────────────┘
          │
┌─────────▼────────────────────────────────────────────────┐
│                  React Query Cache Layer                  │
│  queryKey: ['tail', tailId, 'metric', metricId, range]   │
│  One query per chart × time range combination            │
│  staleTime: 5 minutes (historical data, not live)        │
└──────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Reads From | Writes To |
|-----------|---------------|------------|-----------|
| `TailHistoryPage` | Route entry, tail ID from params, date range picker, layout shell | URL params | `timeRange` in store |
| `FlightMapComponent` | Leaflet/Mapbox map with RAG-colored route segments, updates active segment during playback | `playhead`, `timeRange` from store | nothing (read-only consumer) |
| `PlaybackBar` | MUI Discrete Slider, play/pause/speed controls, discrete marks at flight events + day boundaries | `zoomedRange`, `playhead`, `playback` from store | `playhead`, `playback`, `zoomedRange` (reset) |
| `ChartPanel` | Host container for all chart strips (default + custom). Owns the chart registry ref. | `customCharts`, `zoomedRange` from store | registers chart instances |
| `DefaultChartStrip` | Single pre-configured HighCharts chart (e.g., Latency, Events Timeline). Registers self on mount. | metric data from React Query | `zoomedRange` in store (on zoom event) |
| `CustomChartStrip` | Same as DefaultChartStrip but metric/type are runtime-selected | metric data from React Query | `zoomedRange` in store (on zoom event) |
| `ChartBuilderDrawer` | Metric selector, chart type picker, add chart action | `metricLibrary` from store | appends to `customCharts` in store |
| `MetricSearchInput` | Searchable metric list with category grouping | `metricLibrary` from store | selection callback |

---

## The Synchronized Zoom Pattern (Critical Implementation)

This is the highest-risk architectural seam. The implementation must follow the `afterSetExtremes` + `trigger` guard pattern used in the official HighCharts synchronized-charts demo.

### How It Works

1. User drag-selects a time range on any chart (zoom gesture)
2. HighCharts fires `xAxis.events.setExtremes` on that chart with `event.trigger === 'zoom'`
3. The handler writes the new `{ min, max }` to the Zustand `zoomedRange`
4. A `useEffect` in each chart component watches `zoomedRange`
5. When `zoomedRange` changes, the effect calls `chart.xAxis[0].setExtremes(min, max, true, false, { trigger: 'sync' })` on every registered chart instance EXCEPT the one that triggered the change
6. The `trigger: 'sync'` guard prevents the receiving charts from re-firing step 2, breaking the feedback loop

```typescript
// In each chart component's options
xAxis: {
  events: {
    setExtremes(e: Highcharts.AxisSetExtremesEventObject) {
      // Guard: ignore events we ourselves caused via sync
      if (e.trigger === 'sync') return;
      // Write canonical range to store
      setZoomedRange(
        e.min != null && e.max != null
          ? { min: e.min, max: e.max }
          : null
      );
    },
  },
},
```

```typescript
// In ChartPanel or a shared hook: useChartSync
useEffect(() => {
  if (!zoomedRange) {
    // Reset zoom on all charts
    chartRegistry.forEach((chart) => {
      chart.xAxis[0].setExtremes(null, null, true, false, { trigger: 'sync' });
    });
    return;
  }
  chartRegistry.forEach((chart) => {
    chart.xAxis[0].setExtremes(
      zoomedRange.min,
      zoomedRange.max,
      true,   // redraw
      false,  // no animation (performance)
      { trigger: 'sync' }
    );
  });
}, [zoomedRange]);
```

### Chart Instance Registry

HighCharts chart instances are mutable objects — storing them in Zustand or React state would cause stale closures and unnecessary re-renders. The registry is a `useRef`-held `Map` owned by `ChartPanel`:

```typescript
// In ChartPanel
const chartRegistryRef = useRef<Map<string, Highcharts.Chart>>(new Map());

const registerChart = useCallback((id: string, chart: Highcharts.Chart) => {
  chartRegistryRef.current.set(id, chart);
}, []);

const unregisterChart = useCallback((id: string) => {
  chartRegistryRef.current.delete(id);
}, []);
```

Each chart strip receives `registerChart` and `unregisterChart` as props and calls them via the HighCharts React ref callback:

```typescript
// In DefaultChartStrip / CustomChartStrip
const hcRef = useRef<HighchartsReact.RefObject>(null);

useEffect(() => {
  const chart = hcRef.current?.chart;
  if (chart) {
    registerChart(chartId, chart);
    return () => unregisterChart(chartId);
  }
}, []);
```

The `HighchartsReact` component exposes the chart instance via `ref.current.chart` (the `highcharts-react-official` package's `RefObject` type). This is a stable, documented pattern.

**Do NOT use `Highcharts.charts` (global array):** The global array includes destroyed/null entries and has no stable identity for custom chart management. Use the explicit registry.

---

## Playback Timeline Architecture

The playback system drives a `playhead` timestamp through the shared store. All consumers react to it independently.

```
PlaybackBar
  ├── reads:  zoomedRange (defines slider min/max)
  ├── reads:  playhead (controlled slider value)
  ├── writes: playhead (on scrub)
  ├── writes: playback.active (play/pause)
  └── writes: playback.speed (0.5x / 1x / 2x / 4x)

usePlaybackEffect (custom hook, lives in PlaybackBar or parent)
  ├── setInterval that advances playhead by (tick * speed)
  ├── clears on pause or when playhead reaches range end
  └── writes: playhead

FlightMapComponent
  └── reads: playhead → highlights current route segment

DefaultChartStrip / CustomChartStrip
  └── reads: playhead → draws HighCharts xAxis plotLine (vertical cursor)
```

### Playback Marks (MUI Discrete Slider)

The marks array is derived from flight event timestamps and day boundaries within the current `zoomedRange`. This derivation is a pure selector — compute it from the store, do not store it separately:

```typescript
const marks = useMemo(() =>
  computePlaybackMarks(flightEvents, zoomedRange ?? timeRange),
  [flightEvents, zoomedRange, timeRange]
);
```

### Playhead Crosshair on Charts

Each chart renders the `playhead` as a HighCharts `xAxis.plotLines` entry. Because HighCharts plot lines are updated via the `chart.xAxis[0].update()` API (not re-render), use the imperative update path to avoid full chart re-renders:

```typescript
useEffect(() => {
  const chart = hcRef.current?.chart;
  if (!chart) return;
  chart.xAxis[0].update({
    plotLines: [{ value: playhead, color: '#FF6B6B', width: 2, id: 'playhead' }],
  }, true); // redraw immediately
}, [playhead]);
```

---

## State Architecture

### What Lives Where

| State | Location | Rationale |
|-------|----------|-----------|
| `timeRange` (full window) | Zustand view store | Shared by map, charts, API queries |
| `zoomedRange` (zoomed subset) | Zustand view store | Must be shared across all charts simultaneously |
| `playhead` (current timestamp) | Zustand view store | Read by map, charts, playback bar |
| `playback.active`, `playback.speed` | Zustand view store | Playback bar controls, effect hook reads |
| `customCharts[]` (chart definitions) | Zustand view store | Survives between panel collapses, drag-reorder modifies it |
| `metricLibrary` | Zustand view store | Loaded once, heavy to re-fetch |
| `chartInstances` | `useRef` Map in ChartPanel | Mutable, must not trigger re-renders |
| Fetched metric data | React Query cache | Per-metric, per-time-range queries |
| Drawer open/close | Local component state | No cross-component consumers |
| Metric search filter text | Local component state | Lives and dies with `ChartBuilderDrawer` |
| Drag-in-progress state | dnd-kit internal | Library manages this |

### Why Not Context

The Insights ecosystem mandates Zustand (`useBearStore` / `createViewStore()`). React Context is explicitly excluded. This is the right call: Context would cause every chart to re-render on every playhead tick (60fps during playback), while Zustand subscriptions allow each component to subscribe to only its relevant slice.

### Selector Discipline

During playback, `playhead` updates at up to several times per second. Components that do NOT need `playhead` (e.g., `ChartBuilderDrawer`) must NOT subscribe to it. Use granular selectors:

```typescript
// Good: only re-renders when playhead changes
const playhead = useTailHistoryStore((s) => s.playhead);

// Bad: re-renders on every store change
const store = useTailHistoryStore();
```

---

## Data Flow

```
User Action                  State Change             Side Effects
──────────────────────────   ─────────────────────    ──────────────────────────────
Date range picker → submit   timeRange updated        All React Query keys invalidated
                                                      → refetch all chart data
                                                      → map refetches route segments

User drags chart zoom        zoomedRange updated      useChartSync effect fires
                                                      → setExtremes on all charts
                                                      → PlaybackBar updates min/max

User scrubs playback bar     playhead updated         Each chart updates plotLine
                                                      Map highlights current segment

User presses Play            playback.active = true   usePlaybackEffect interval starts
                             → interval ticks         → playhead advances
                             → playhead at range end  → playback.active = false

User adds custom chart       customCharts[] grows     New ChartStrip mounts
                                                      → React Query fetches metric data
                                                      → Chart registers in registry
                                                      → useChartSync applies current zoom

User removes chart           customCharts[] shrinks   ChartStrip unmounts
                                                      → unregisterChart called

User reorders charts         customCharts[] reordered ChartPanel re-renders in new order
                                                      (no chart re-mounts — key stability)
```

---

## Dynamic Custom Chart Builder

### Chart Definition Schema

Each entry in `customCharts[]` is a plain serializable object (not a chart instance):

```typescript
interface ChartDefinition {
  id: string;          // stable key for React + registry
  metricId: string;    // e.g., "cn0_forward"
  chartType: 'line' | 'bar' | 'area' | 'scatter';
  order: number;       // position in panel
}
```

### Drag-to-Reorder

Use `@dnd-kit/core` + `@dnd-kit/sortable`. react-beautiful-dnd is archived and deprecated as of August 2025 — do not use it.

Pattern: `DndContext` wraps `ChartPanel`. Each `ChartStrip` uses `useSortable`. `onDragEnd` calls `arrayMove` on the `customCharts` array in the store.

Key constraint: React `key` props on chart strips must be the stable `ChartDefinition.id`, not array index. This prevents HighCharts from destroying and recreating chart instances when order changes.

### Chart Type Compatibility

The `MetricDef` in the library carries `compatibleChartTypes: ChartType[]`. The chart type picker in `ChartBuilderDrawer` filters its options by this list. Validated at definition creation, not at render time.

---

## Architecture for HighCharts Integration

### Package

Use `highcharts-react-official` (npm: `highcharts-react-official`). This is the official wrapper maintained by HighCharts. It accepts `options`, `highcharts`, `constructorType`, and a `ref` prop typed as `HighchartsReact.RefObject`.

### Module Loading

HighCharts modules (Gantt for Events Timeline, boost for large datasets) must be initialized before first render:

```typescript
// src/lib/highcharts.ts — import once at app entry
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsBoost from 'highcharts/modules/boost';

HighchartsGantt(Highcharts);
HighchartsBoost(Highcharts);

export { Highcharts };
```

Import this module at the top of `TailHistoryPage` (or app root) to guarantee initialization order.

### Events Timeline (Gantt Chart)

The Events Timeline (Disconnected / Acquiring / Connected / Network Change) is best rendered as a HighCharts Gantt chart. Use `constructorType="ganttChart"` on the `HighchartsReact` component. The Gantt chart uses a different x-axis model but still participates in zoom sync via the same `xAxis.events.setExtremes` handler.

---

## React Query Integration

### Query Key Structure

All metric data queries are keyed by tail ID, metric ID, and time range. This ensures:
- Different tails never share cached data
- Zooming does NOT refetch data (zoom is client-side; data for the full `timeRange` is already fetched)
- Changing the date picker range invalidates and refetches everything

```typescript
queryKey: ['tail', tailId, 'metric', metricId, { start: timeRange.start, end: timeRange.end }]
```

### Fetch Granularity

Fetch the full `timeRange` upfront, not the `zoomedRange`. Zoom is a purely client-side view operation on already-loaded data. This eliminates refetch jank during zoom interactions.

If metric datasets exceed browser memory limits (unlikely for 14-day aviation data), revisit with server-side downsampling or HighCharts Boost module (which handles 100k+ points).

---

## Build Order Implications

The architecture has hard dependencies that dictate phase sequence:

### Phase 1 — Foundation (must be first)
- Zustand store shape with all state slices defined
- `timeRange`, `zoomedRange`, `playhead`, `customCharts` in store
- React Query setup with tail/metric query key pattern
- HighCharts module initialization (`src/lib/highcharts.ts`)
- `TailHistoryPage` shell with layout regions stubbed out
- **Why first:** Every subsequent component depends on the store shape being stable. Changing state shape later cascades everywhere.

### Phase 2 — Single Chart + Zoom (validate the hardest part early)
- `DefaultChartStrip` for one metric (e.g., Latency)
- Chart registry ref in `ChartPanel`
- `setExtremes` handler writing to `zoomedRange`
- `useChartSync` effect applying zoom to registry
- **Why second:** The synchronized zoom is the highest-risk pattern. Prove it works with two charts before building all others. Discovering a flaw here after 10 charts are built is expensive.

### Phase 3 — All Default Charts
- Remaining `DefaultChartStrip` instances
- Events Timeline (Gantt chart type)
- Verify zoom sync works with 8–10 simultaneous charts
- **Why here:** Low risk after Phase 2 proves the pattern. This is parallelizable implementation work.

### Phase 4 — Playback Timeline
- `PlaybackBar` with MUI Discrete Slider
- `usePlaybackEffect` hook
- Playhead `plotLine` in each chart
- Flight event marks derivation
- **Why after charts:** Charts must be built to test the crosshair. PlaybackBar also consumes `zoomedRange` which must be stable.

### Phase 5 — Custom Chart Builder
- `ChartBuilderDrawer` and `MetricSearchInput`
- `ChartDefinition` schema + `customCharts` store slice
- `CustomChartStrip` component
- dnd-kit drag-to-reorder
- **Why last among chart work:** Depends on the chart strip pattern being stable from Phase 2–3. Metric library must be defined.

### Phase 6 — Flight Map
- Map component with RAG route segments
- Playhead-driven segment highlighting
- **Why late:** Map is somewhat independent but benefits from `playhead` being stable (Phase 4). Can be parallelized with Phase 5 if team capacity allows.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Chart Instances in Zustand
**What goes wrong:** Zustand serializes state for devtools and compares by reference for subscriptions. HighCharts chart instances are complex mutable objects — storing them breaks both.
**Instead:** `useRef`-held `Map` in `ChartPanel`. Pass registration callbacks as props.

### Anti-Pattern 2: Fetching Data at Zoomed Range
**What goes wrong:** Every zoom causes an API refetch and a loading state flicker. The entire analytical workflow breaks down.
**Instead:** Fetch at `timeRange` (full window). Zoom is purely a client-side view operation.

### Anti-Pattern 3: Keying Charts by Array Index
**What goes wrong:** When user reorders charts, React sees new order and unmounts/remounts components. HighCharts instances are destroyed, losing zoom state and animation history.
**Instead:** `key={chartDef.id}` — stable UUID per chart definition.

### Anti-Pattern 4: No Feedback-Loop Guard on setExtremes
**What goes wrong:** Chart A fires `setExtremes`, updates store, `useEffect` calls `setExtremes` on Chart B, Chart B fires its own `setExtremes` event, updates store again, infinite loop.
**Instead:** The `trigger: 'sync'` parameter on programmatic `setExtremes` calls, guarded by `if (e.trigger === 'sync') return` in the event handler.

### Anti-Pattern 5: Subscribing All Components to `playhead`
**What goes wrong:** During playback, `playhead` updates multiple times per second. If 20+ components subscribe, every tick causes 20+ re-renders. UI becomes janky.
**Instead:** Only `PlaybackBar`, `FlightMapComponent`, and chart strips subscribe to `playhead`. Chart strips use the imperative `chart.xAxis[0].update()` path for the plotLine, not options re-renders.

### Anti-Pattern 6: Using Highcharts.charts Global Array for Sync
**What goes wrong:** `Highcharts.charts` includes null entries for destroyed charts, has no stable IDs, and conflicts if multiple dashboard instances exist on the page.
**Instead:** Explicit `Map<string, Highcharts.Chart>` registry with stable IDs from `ChartDefinition`.

---

## Scalability Considerations

| Concern | Now (launch) | If 40+ charts | If 80+ charts |
|---------|-------------|---------------|---------------|
| Sync performance | setExtremes loop is O(n) — fine for 10 charts | May need requestAnimationFrame batching | Virtualize chart list, only sync visible charts |
| Data memory | Full 14-day dataset per metric per fetch | Add React Query cache size limits | Server-side time-bucketing / downsampling |
| Playback smoothness | setInterval at 100ms tick is fine | same | same |
| Drag reorder | dnd-kit handles 100+ items | same | Virtualize if needed |

The HighCharts Boost module (already planned to initialize) handles 100,000+ point rendering. For aviation telemetry over 14 days, this is unlikely to be needed at launch but it costs nothing to initialize.

---

## Sources

- HighCharts synchronized-charts demo (jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/synchronized-charts/) — `afterSetExtremes` pattern, `Highcharts.charts` iteration, `trigger` guard — MEDIUM confidence (pattern confirmed via fetched code description)
- HighCharts API: `xAxis.events.setExtremes` — event.min, event.max, event.trigger — HIGH confidence (official API docs)
- HighCharts API: `xAxis.events.afterSetExtremes` — fires after min/max corrected for minRange — HIGH confidence (official API docs)
- HighCharts API: `chart.zooming.type` — x/y/xy values — HIGH confidence (official API docs)
- React `useRef` documentation (react.dev) — mutable instance storage pattern — HIGH confidence
- React Query: query key structure with dependent parameters — HIGH confidence (official docs)
- MUI Slider: marks prop, step={null} for snap-to-mark, valueLabelDisplay — HIGH confidence (official MUI docs)
- react-beautiful-dnd archived August 2025, deprecated on npm — HIGH confidence (GitHub repository)
- dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) — `useSortable`, `SortableContext` pattern — MEDIUM confidence (docs.dndkit.com inaccessible, confirmed via GitHub package description)
- Insights ecosystem constraints (Zustand `createViewStore`, React Query `useFetch`, MUI v6, Emotion) — HIGH confidence (from PROJECT.md)
