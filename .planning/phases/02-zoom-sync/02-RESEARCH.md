/***
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * The information in this software is subject to change without notice and
 * should not be construed as a commitment by Viasat, Inc.
 *
 * Viasat Proprietary
 * The Proprietary Information provided herein is proprietary to Viasat and
 * must be protected from further distribution and use. Disclosure to others,
 * use or copying without express written authorization of Viasat, is strictly
 * prohibited.
 *
 * Description: Phase 2 Zoom Sync — Research
 */

# Phase 2: Zoom Sync — Research

**Researched:** 2026-05-05
**Domain:** Highcharts v12 setExtremes sync, @highcharts/react v4.2.1 component-based API, MUI Slider wiring, ChartStrip component pattern, Vitest mock strategies
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

No CONTEXT.md exists for Phase 2. Constraints are inherited from Phase 1 locked decisions and CLAUDE.md directives.

### Locked Decisions (from Phase 1 and STATE.md)

- **D-03:** Standalone React + TypeScript + MUI v6 project in `tail-history/`. Follow insights-manager patterns.
- **D-05:** Single Highcharts import bundle — `highcharts/highstock` everywhere. Never mix with `highcharts`.
- **D-06:** Zustand store slices: `timeRange`, `zoomedRange`, `playhead`, `playback`, `customCharts`. `zoomedRange` is `ZoomedRange | null` and already exists in the live store.
- **D-07:** Chart instance registry held in `useRef<Map<string, Highcharts.Chart>>` at `TailHistoryPage` level — never in Zustand, never in React state. Register/unregister callbacks passed as props.
- **KEY DECISION:** `setExtremes` must always be called with `{ trigger: 'syncExtremes' }` as the 5th argument, and each chart's `xAxis.events.setExtremes` handler must check `if (e.trigger !== 'syncExtremes')` before propagating. This is THE most dangerous pitfall in Phase 2.
- **@highcharts/react v4.2.1** is the installed component-based wrapper (StockChart / Chart + Series + XAxis components from the library).
- React version installed is actually **19.2.5** (package.json), not 18 as CLAUDE.md states. The @highcharts/react wrapper is forward-compatible with React 19.
- **Vitest** (not Jest) is the test framework — confirmed in `vite.config.ts`.
- **No Redux, no React Context** for state management.
- **Emotion `styled()`** for all component styling — no CSS modules, no hardcoded hex colors.
- Every source file must include Viasat copyright header (© 2026 Viasat, Inc.).

### Claude's Discretion

- Exact `ChartStrip` component interface design — props shape, file location, internal structure
- Mock data shape for the two proof-of-concept charts (Latency and a second chart)
- Vitest mock strategy for Highcharts chart instances
- Whether to use the `<XAxis>` component or the `options` prop for `xAxis.events.setExtremes`
- MUI Slider min/max/value wiring details
- "Reset Zoom" button placement (in PageHeader or inline with charts)

### Deferred Ideas (OUT OF SCOPE for Phase 2)

- All 8 default charts (Phase 3)
- Real API data (Phase 3) — Phase 2 uses mock data only
- Crosshair playback at 60fps (Phase 4)
- Playback controls play/pause/speed (Phase 4)
- Custom chart builder (Phase 5)
- Drag-to-reorder (Phase 5)
- Crosshair hover sync across charts (v2 requirement)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ZOOM-01 | User can drag-select a time region on any chart to zoom in (Highcharts draggable zoom enabled) | `chart.zooming.type: 'x'` option confirmed from Highcharts v12 types; `SelectEventObject` type confirmed; `chart.events.selection` callback documented |
| ZOOM-02 | When user zooms one chart, all other charts instantly zoom to the same time range (via `setExtremes` with `trigger: 'syncExtremes'` guard to prevent feedback loops) | `axis.setExtremes(min, max, redraw, animation, eventArguments)` 5-parameter signature confirmed from Highcharts types; `AxisSetExtremesEventObject.trigger` field confirmed; `setExtremes` guard pattern documented |
| ZOOM-03 | The playback timeline slider updates its visible range to match the currently zoomed window | MUI Slider `min/max/value` props map directly to `zoomedRange`; `setZoomedRange` Zustand action already exists |
| ZOOM-04 | A reset zoom button restores all charts and the slider to the full selected time range | `axis.setExtremes(undefined, undefined, true, false, { trigger: 'syncExtremes' })` pattern documented; `setZoomedRange(null)` resets Zustand |
</phase_requirements>

---

## Summary

Phase 2 proves the synchronized zoom feedback-loop guard with exactly two charts before building the full 8-chart suite in Phase 3. The feedback-loop guard is the single most correctness-critical piece of logic in the entire project — getting it right now prevents an infinite render loop from ever entering Phase 3.

The synchronization architecture is: a user drag-zooms Chart A → Highcharts fires `xAxis.events.setExtremes` on Chart A → the handler checks `e.trigger !== 'syncExtremes'` (it is not, so it proceeds) → it iterates the `chartRegistryRef` Map → calls `axis.setExtremes(min, max, true, false, { trigger: 'syncExtremes' })` on every other chart → each of those charts fires their own `setExtremes` event, but the guard `e.trigger !== 'syncExtremes'` is now FALSE, so they immediately return → no loop. Additionally, `setZoomedRange({ min, max })` is called on the Zustand store so the MUI Slider can react. "Reset Zoom" calls `setExtremes(undefined, undefined, true, false, { trigger: 'syncExtremes' })` on all charts and `setZoomedRange(null)` on the store.

The `@highcharts/react` v4.2.1 component-based API (`<StockChart>`, `<XAxis>`, `<Series>`) is confirmed installed. The `ref` forwarded to `<StockChart>` gives access to `ref.current.chart` (the live `Highcharts.Chart` instance). The `registerChart` / `unregisterChart` callbacks from Phase 1 are unchanged — Phase 2 wires them into `ChartStrip` via a `useEffect` that fires on chart mount.

**Primary recommendation:** Implement zoom sync via `xAxis.events.setExtremes` (not `chart.events.selection`). The `setExtremes` approach handles both drag-select zoom AND programmatic resets in a single code path. The `chart.events.selection` approach only fires on user drag, not on programmatic calls, so it cannot handle the reset case.

---

## Project Constraints (from CLAUDE.md)

| Directive | What It Means for Phase 2 |
|-----------|--------------------------|
| Every source file must include Viasat copyright header (© 2026 Viasat, Inc.) | All new files: `ChartStrip.tsx`, `useChartSync.ts`, `ZoomControls.tsx`, test files |
| React + TypeScript + MUI v6 + HighCharts — remain consistent with Insights ecosystem | No new charting libraries; MUI Slider from `@mui/material` |
| Zustand via `createViewStore()` — no Redux, no React Context | `setZoomedRange` and `zoomedRange` selectors from existing `useTailHistoryStore` |
| TanStack React Query via `useFetch` — no raw `fetch`, no axios | Phase 2 uses mock data; no API calls yet, but keep pattern ready for Phase 3 |
| Emotion `styled()` or MUI `styled()` — no CSS modules, no hardcoded hex colors | `ChartStrip` container uses `styled(Box)` from `@mui/material/styles`; colors from `colors.ts` |
| `highcharts/highstock` as single import bundle everywhere | `import Highcharts from 'highcharts/highstock'` in all new files |

---

## Standard Stack

### Core (unchanged from Phase 1 — all installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.5 (installed) | UI rendering | Ecosystem constraint — note: package.json shows 19.x installed, not 18.x as CLAUDE.md states. @highcharts/react 4.2.1 is compatible. |
| TypeScript | ~6.0.2 (installed) | Type safety | Ecosystem constraint |
| `highcharts` | ^12.6.0 (installed) | Chart engine — import via `highcharts/highstock` | Ecosystem constraint; v12 uses DataTable internals |
| `@highcharts/react` | ^4.2.1 (installed) | Official React wrapper | Component-based API: `<StockChart>`, `<Series>`, `<XAxis>` |
| `zustand` | ^5.0.13 (installed) | State management | `useTailHistoryStore` already has `zoomedRange` + `setZoomedRange` |
| `@mui/material` | ^6.5.0 (installed) | MUI Slider, Button, Box | Platform constraint |

### No New Packages Required for Phase 2

All dependencies needed for Phase 2 are already installed from Phase 1. No `npm install` step is needed.

---

## Architecture Patterns

### Recommended File Structure for Phase 2

```
tail-history/src/
├── pages/tailHistory/
│   ├── TailHistoryPage.tsx         # MODIFY: wire chartRegistryRef into ChartStrip props; add ZoomControls
│   ├── PageHeader.tsx              # POSSIBLY MODIFY: add Reset Zoom button if placing it in header
│   ├── tailHistoryStore.ts         # NO CHANGE (zoomedRange slice already present)
│   └── ZoomControls.tsx            # NEW: MUI Slider + Reset Zoom button
├── components/
│   └── ChartStrip/
│       ├── ChartStrip.tsx          # NEW: reusable chart container with sync wiring
│       └── ChartStrip.types.ts     # NEW: ChartStripProps interface
├── hooks/
│   └── useChartSync.ts             # NEW: setExtremes handler factory + registry walk
└── __tests__/
    ├── ChartStrip.test.tsx         # NEW: ZOOM-01 coverage
    ├── useChartSync.test.ts        # NEW: ZOOM-02 coverage (feedback loop guard)
    └── ZoomControls.test.tsx       # NEW: ZOOM-03 + ZOOM-04 coverage
```

### Pattern 1: `useChartSync` Hook — The Feedback-Loop Guard

**What:** A custom hook that returns a stable `setExtremes` event handler. When one chart fires `setExtremes`, this handler iterates the chart registry, calls `axis.setExtremes` on all other charts with `{ trigger: 'syncExtremes' }`, and writes `zoomedRange` to Zustand.

**When to use:** Created once at `TailHistoryPage` level (or inside `ChartStrip` with ref passed down). Each `ChartStrip` instance receives the same handler.

**Exact `setExtremes` signature (verified from `highcharts.d.ts` line 187338):**
```typescript
setExtremes(
  min?: (number|string),
  max?: (number|string),
  redraw?: boolean,
  animation?: (boolean | Partial<AnimationOptionsObject>),
  eventArguments?: any   // <-- 5th param — pass { trigger: 'syncExtremes' } HERE
): void;
```

**Implementation:**
```typescript
// src/hooks/useChartSync.ts
/***
 * Copyright (C) 2026 Viasat, Inc.
 * ...
 * Description: Hook providing the setExtremes sync handler with feedback-loop guard
 */
import {useCallback} from 'react';
import Highcharts from 'highcharts/highstock';
import useTailHistoryStore from '../pages/tailHistory/tailHistoryStore';

// The trigger sentinel — used as the 5th argument to setExtremes
// and checked in the event handler to break the propagation loop.
export const SYNC_TRIGGER = 'syncExtremes';

export function useChartSync(chartRegistryRef: React.RefObject<Map<string, Highcharts.Chart>>) {
  const setZoomedRange = useTailHistoryStore(state => state.setZoomedRange);

  // Returns the xAxis.events.setExtremes handler for a given chartId.
  // The handler propagates zoom to all OTHER charts in the registry.
  const makeSetExtremesHandler = useCallback(
    (ownChartId: string) =>
      (e: Highcharts.AxisSetExtremesEventObject) => {
        // CRITICAL: Guard against the feedback loop.
        // When we call setExtremes on other charts, they fire this event
        // with trigger === SYNC_TRIGGER. We must not re-propagate.
        if (e.trigger === SYNC_TRIGGER) return;

        const {min, max} = e;

        // Write zoomed range to Zustand so the slider can react
        if (min !== undefined && max !== undefined) {
          setZoomedRange({min, max});
        } else {
          setZoomedRange(null);
        }

        // Propagate to all other charts in the registry
        chartRegistryRef.current?.forEach((chart, id) => {
          if (id === ownChartId) return; // skip self
          const axis = chart.xAxis[0];
          if (!axis) return;
          // 5th argument is the eventArguments that becomes e.trigger
          axis.setExtremes(min, max, true, false, {trigger: SYNC_TRIGGER});
        });
      },
    [chartRegistryRef, setZoomedRange]
  );

  // Reset all charts to the full time range
  const resetZoom = useCallback(() => {
    setZoomedRange(null);
    chartRegistryRef.current?.forEach(chart => {
      const axis = chart.xAxis[0];
      if (!axis) return;
      // undefined min/max tells Highcharts to restore auto-computed extremes
      axis.setExtremes(undefined, undefined, true, false, {trigger: SYNC_TRIGGER});
    });
  }, [chartRegistryRef, setZoomedRange]);

  return {makeSetExtremesHandler, resetZoom};
}
```

**Key detail on `e.trigger`:** The `AxisSetExtremesEventObject.trigger` field type is `string | AxisExtremesTriggerValue`. Standard Highcharts-generated trigger values are `'navigator'`, `'pan'`, `'scrollbar'`, `'zoom'`, `'rangeSelectorButton'`, `'rangeSelectorInput'`, `'traverseUpButton'`. A user drag-select zoom fires with trigger `'zoom'`. Our custom trigger `'syncExtremes'` is a string literal not in that enum — it is intentionally novel. The string comparison `e.trigger === 'syncExtremes'` is the guard.

### Pattern 2: `ChartStrip` Component — The Reusable Chart Container

**What:** A wrapper component that renders one `<StockChart>` with:
- Zoom enabled (`chart.zooming.type: 'x'`)
- The `setExtremes` event handler wired to its `xAxis.events.setExtremes`
- A `ref` that captures the chart instance and calls `registerChart` on mount
- A stable chart ID (UUID, passed as prop from parent) for registry keying

**Why `StockChart` not `Chart`:** The project uses `highcharts/highstock` as the single base import. `StockChart` from `@highcharts/react` imports from `highcharts/esm/highstock.src.js` internally. Using `Chart` (which internally imports from `highcharts/esm/highcharts.src.js`) would introduce the banned mixed-import pattern.

**Import pattern:**
```typescript
// CORRECT — matches the project's single-bundle rule
import {StockChart, StockSeries} from '@highcharts/react/Stock';
// or equivalently:
import StockChart, {StockSeries} from '@highcharts/react/Stock';
```

**Alternatively**, the `<Chart>` component with `chartConstructor="stockChart"` prop also works and avoids the mixed-import issue because it uses the Highcharts instance set by `setHighcharts()` (which was already called at global scope for highstock in `main.tsx`). Either approach is valid; the `StockChart` import is more explicit.

**ChartStrip component structure:**
```typescript
// src/components/ChartStrip/ChartStrip.tsx
/***
 * Copyright (C) 2026 Viasat, Inc.
 * ...
 * Description: Reusable chart container that wires zoom sync into every chart
 */
import React, {useRef, useEffect, useCallback} from 'react';
import {styled} from '@mui/material/styles';
import {Box, Typography} from '@mui/material';
import {StockChart, StockSeries} from '@highcharts/react/Stock';
import type {HighchartsReactRefObject} from '@highcharts/react/Stock';
import Highcharts from 'highcharts/highstock';
import {SURFACE_GREY} from '../../theme/colors';
import {SYNC_TRIGGER} from '../../hooks/useChartSync';

export interface ChartStripProps {
  /** Stable UUID — React key AND chart registry key */
  chartId: string;
  /** Chart title displayed above the chart */
  title: string;
  /** Series data — array of [timestamp, value] tuples or HC SeriesOptionsType */
  series: Highcharts.SeriesOptionsType[];
  /** Register this chart instance in the parent registry */
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  /** Deregister this chart instance from the parent registry */
  unregisterChart: (id: string) => void;
  /** Sync handler — fires when this chart's xAxis extremes change */
  onSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
  /** Container height in pixels (default 200) */
  height?: number;
}

const StripContainer = styled(Box)({
  width: '100%',
  marginBottom: '16px',
  backgroundColor: '#FFFFFF', // WHITE
  borderRadius: '4px',
  border: `1px solid ${SURFACE_GREY[200]}`,
  padding: '8px 16px'
});

const ChartStrip: React.FC<ChartStripProps> = ({
  chartId,
  title,
  series,
  registerChart,
  unregisterChart,
  onSetExtremes,
  height = 200
}) => {
  const chartRef = useRef<HighchartsReactRefObject>(null);

  // Register chart instance after mount, unregister on unmount
  useEffect(() => {
    const chartInstance = chartRef.current?.chart;
    if (chartInstance) {
      registerChart(chartId, chartInstance);
    }
    return () => {
      unregisterChart(chartId);
    };
  }, [chartId, registerChart, unregisterChart]);

  const chartOptions: Highcharts.Options = {
    chart: {
      height,
      zooming: {type: 'x'},
      animation: false  // disable animation so sync feels instant
    },
    xAxis: {
      type: 'datetime',
      events: {
        setExtremes: onSetExtremes
      }
    },
    yAxis: {title: {text: null}},
    title: {text: null},  // title rendered via Typography above chart
    credits: {enabled: false},
    legend: {enabled: false},
    navigator: {enabled: false},
    scrollbar: {enabled: false},
    rangeSelector: {enabled: false},
    series
  };

  return (
    <StripContainer>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <StockChart
        ref={chartRef}
        options={chartOptions}
        containerProps={{style: {width: '100%', height: `${height}px`}}}
      />
    </StripContainer>
  );
};

export default ChartStrip;
```

**Critical note on `useEffect` and chart registration:** The `@highcharts/react` v4.2.1 wrapper creates the chart in its own `useEffect`. The chart instance is available at `chartRef.current?.chart` only after the wrapper's effect has run. Since both effects run after the same render, Highcharts creates the chart in the library's effect first (it is registered first because the `forwardRef` wrapper's `useImperativeHandle` and chart-creation `useEffect` run in child-before-parent order — but effect order within the same component level is top-down). In practice: the `ChartStrip`'s `useEffect` should check for `chartRef.current?.chart` existence and use a small fallback (or rely on the fact that `@highcharts/react` uses a synchronous chart creation on first render in Highcharts v12). If the chart instance is not yet available, defer via `requestAnimationFrame` or a `useLayoutEffect`.

**Simpler alternative:** Use `options.chart.events.load` callback (fires once after chart is created) to call `registerChart`. This avoids the useEffect ordering issue entirely:
```typescript
const chartOptions: Highcharts.Options = {
  chart: {
    events: {
      load(this: Highcharts.Chart) {
        registerChart(chartId, this);
      }
    }
  }
};
```
Then `unregisterChart` goes in `useEffect(() => () => unregisterChart(chartId), [chartId, unregisterChart])` for cleanup only.

### Pattern 3: TailHistoryPage Modifications

**What:** Wire `useChartSync` and `ChartStrip` into the page. Add two proof-of-concept charts.

```typescript
// TailHistoryPage.tsx — Phase 2 additions
import {useRef, useCallback} from 'react';
import {v4 as uuidv4} from 'uuid';
import ChartStrip from '../../components/ChartStrip/ChartStrip';
import ZoomControls from './ZoomControls';
import {useChartSync} from '../../hooks/useChartSync';

// Stable IDs for the two PoC charts — defined OUTSIDE the component
// to prevent re-creation on every render.
const CHART_IDS = {
  latency: uuidv4(),       // stable for this session
  packetLoss: uuidv4()
};

const TailHistoryPage: React.FC = () => {
  const chartRegistryRef = useRef<Map<string, Highcharts.Chart>>(new Map());
  const {makeSetExtremesHandler, resetZoom} = useChartSync(chartRegistryRef);

  const registerChart = useCallback((id: string, chart: Highcharts.Chart) => {
    chartRegistryRef.current.set(id, chart);
  }, []);

  const unregisterChart = useCallback((id: string) => {
    chartRegistryRef.current.delete(id);
  }, []);

  return (
    <PageContainer>
      <PageHeader tailId={tailId} />
      <ZoomControls onResetZoom={resetZoom} />
      <ContentArea>
        <ChartStrip
          chartId={CHART_IDS.latency}
          title="Latency"
          series={MOCK_LATENCY_SERIES}
          registerChart={registerChart}
          unregisterChart={unregisterChart}
          onSetExtremes={makeSetExtremesHandler(CHART_IDS.latency)}
        />
        <ChartStrip
          chartId={CHART_IDS.packetLoss}
          title="Packet Loss"
          series={MOCK_PACKET_LOSS_SERIES}
          registerChart={registerChart}
          unregisterChart={unregisterChart}
          onSetExtremes={makeSetExtremesHandler(CHART_IDS.packetLoss)}
        />
      </ContentArea>
    </PageContainer>
  );
};
```

**Warning:** `makeSetExtremesHandler(CHART_IDS.latency)` must be called outside the JSX (e.g., computed in the component body with `useMemo` or stored in a variable) to prevent a new function reference on every render. A new function reference causes the `<XAxis events>` to update on every render, triggering Highcharts to reattach the listener and potentially causing flicker.

### Pattern 4: ZoomControls Component — Slider + Reset Button

**What:** Reads `zoomedRange` and `timeRange` from Zustand. Renders an MUI Slider showing the zoomed window within the full time range. Renders a Reset Zoom button.

```typescript
// src/pages/tailHistory/ZoomControls.tsx
import {Slider, Button, Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import useTailHistoryStore from './tailHistoryStore';

interface ZoomControlsProps {
  onResetZoom: () => void;
}

const ControlsRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '8px 32px'
});

const ZoomControls: React.FC<ZoomControlsProps> = ({onResetZoom}) => {
  const timeRange = useTailHistoryStore(state => state.timeRange);
  const zoomedRange = useTailHistoryStore(state => state.zoomedRange);

  const sliderMin = timeRange.start;
  const sliderMax = timeRange.end;
  const sliderValue: [number, number] = zoomedRange
    ? [zoomedRange.min, zoomedRange.max]
    : [timeRange.start, timeRange.end];

  return (
    <ControlsRow>
      <Slider
        min={sliderMin}
        max={sliderMax}
        value={sliderValue}
        step={60_000}  // 1-minute resolution
        disabled      // read-only in Phase 2; Phase 4 makes it interactive
        valueLabelDisplay="off"
        data-testid="zoom-slider"
      />
      <Button
        variant="outlined"
        size="small"
        onClick={onResetZoom}
        disabled={zoomedRange === null}
        data-testid="reset-zoom-button"
      >
        Reset Zoom
      </Button>
    </ControlsRow>
  );
};
```

**Note on slider interactivity:** ZOOM-03 requires only that the slider's visible range narrows to match the zoomed window. The slider does NOT need to be interactive in Phase 2 — that is Phase 4 (PLAY-01). Setting `disabled` in Phase 2 prevents the slider from firing unwanted events while still rendering the visual range.

### Pattern 5: Mock Data for Two PoC Charts

**What:** Static mock data arrays that look like real aviation telemetry. No API calls in Phase 2.

```typescript
// src/pages/tailHistory/__mocks__/chartData.ts
// (or inline in TailHistoryPage.tsx)

const NOW = Date.now();
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const START = NOW - FOURTEEN_DAYS_MS;
const POINT_INTERVAL_MS = 5 * 60 * 1000; // 5-minute intervals
const NUM_POINTS = FOURTEEN_DAYS_MS / POINT_INTERVAL_MS; // ~2,016 points

function generateMockSeries(
  seed: number,
  min: number,
  max: number
): [number, number][] {
  const data: [number, number][] = [];
  let value = (min + max) / 2;
  for (let i = 0; i < NUM_POINTS; i++) {
    const t = START + i * POINT_INTERVAL_MS;
    // Random walk within [min, max]
    value = Math.max(min, Math.min(max, value + (Math.random() - 0.5) * (max - min) * 0.1));
    data.push([t, Math.round(value * 10) / 10]);
  }
  return data;
}

export const MOCK_LATENCY_SERIES: Highcharts.SeriesOptionsType[] = [
  {type: 'line', name: 'Avg Latency (ms)', data: generateMockSeries(1, 20, 800), color: '#724AE8'}
];

export const MOCK_PACKET_LOSS_SERIES: Highcharts.SeriesOptionsType[] = [
  {type: 'line', name: 'Packet Loss (%)', data: generateMockSeries(2, 0, 15), color: '#E73737'}
];
```

**Why 2,016 points:** Aviation telemetry at 5-minute resolution over 14 days = 2,016 points/series. This is above the default `turboThreshold: 1,000` — which is already set to `0` globally in `main.tsx`. This exercises the turboThreshold fix from Phase 1.

**Why datetime tuples not objects:** Highcharts fastest rendering format is `[timestamp, value]` numeric tuple arrays. Object format `{x, y}` is valid but slower. Use tuples for the proof-of-concept data.

### Pattern 6: Enabling Drag-Select Zoom in Highcharts v12

**What:** The `chart.zooming.type` option replaced the deprecated `chart.zoomType` in modern Highcharts. Both still work in v12, but the current API is `chart.zooming.type`.

**Verified from Highcharts TypeScript definitions (lines 6479, 7631–7694):**
```typescript
// In ChartOptions:
zooming?: ChartZoomingOptions;

// ChartZoomingOptions.type:
type?: OptionsChartZoomingTypeValue; // 'x' | 'y' | 'xy'
```

**Usage in `options.chart`:**
```typescript
chart: {
  zooming: {type: 'x'},  // CURRENT API — use this
  // zoomType: 'x'       // DEPRECATED — still works but avoid
}
```

After a user drag-zooms, Highcharts fires `xAxis.events.setExtremes` with `e.trigger === 'zoom'`. This is the entry point for the sync propagation.

**Zoom reset via Highcharts built-in button:** By default, Highcharts shows a "Reset Zoom" button after the user zooms. The project DISABLES this built-in button (confusing UX in a sync scenario where multiple charts are involved) and provides its own button via `ZoomControls`. To disable the built-in button:
```typescript
chart: {
  zooming: {
    type: 'x',
    resetButton: {theme: {display: 'none'}}
  }
}
```

### Anti-Patterns to Avoid

- **Calling `setExtremes` without the 5th `eventArguments`:** If you call `axis.setExtremes(min, max)` without `{ trigger: 'syncExtremes' }`, the handler fires again on the target chart with a null/undefined trigger, causing infinite propagation. The 5th argument is not optional for sync code.

- **Storing chart instances in Zustand:** Highcharts chart objects are mutable, non-serializable, and contain DOM references. Zustand's devtools serializer will throw. Use `useRef<Map>` only.

- **Creating `makeSetExtremesHandler` inside JSX:** Calling `makeSetExtremesHandler(id)` inside `<ChartStrip onSetExtremes={makeSetExtremesHandler(id)} />` creates a new function reference on every React render. Highcharts detects the new event handler and re-attaches it, potentially causing the chart to re-initialize or flicker. Memoize the handler per chart ID with `useMemo` or compute it once in the component body.

- **Using `chart.events.selection` instead of `xAxis.events.setExtremes` for sync:** The `selection` event only fires on user drag-select, not on programmatic `setExtremes` calls. If you use `selection` for sync, the reset flow breaks — calling `axis.setExtremes(undefined, undefined)` does NOT fire `chart.events.selection`.

- **Mixing `Chart` and `StockChart` imports from `@highcharts/react`:** `Chart` internally imports `highcharts/esm/highcharts.src.js`; `StockChart` imports `highcharts/esm/highstock.src.js`. Mixing them creates duplicate Highcharts module registrations and TypeScript declaration conflicts — the same pitfall as mixing `highcharts` and `highcharts/highstock` base imports. Use `StockChart` consistently since the project is on `highcharts/highstock`.

- **UUIDs defined inside the component function body:** `uuidv4()` called inside the component creates a new ID on every render. Stable IDs must be defined at module scope, in a `useRef`, or via a stable memoization strategy (e.g., `useState(() => uuidv4())`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart zoom drag-select UI | Custom mouse event handlers | `chart.zooming.type: 'x'` in Highcharts options | Highcharts handles the rubber-band selection, handles touch pinch, handles cursor change — all free |
| Zoom reset button UX | Custom popover or state manager | `ZoomControls` component + `axis.setExtremes(undefined, undefined)` | Highcharts built-in reset is per-chart; the project needs a multi-chart reset, so disable the built-in and implement one unified button |
| Chart instance lifecycle management | Manual `new Highcharts.Chart()` / `chart.destroy()` | `<StockChart ref={...}>` from `@highcharts/react` | The wrapper handles `chart.destroy()` on component unmount, preventing memory leaks |
| Time-range slider | Custom canvas-based slider | MUI `Slider` with `min`/`max`/`value` | MUI Slider handles WCAG accessibility, keyboard navigation, touch support |
| UUID generation for chart IDs | `Math.random().toString(36)` | `uuid` package (`v4 as uuidv4`) | `uuid` is already installed (Phase 1); v4 UUIDs are cryptographically random — no collision risk |

---

## Common Pitfalls

### Pitfall 1: The `setExtremes` Feedback Loop (MOST DANGEROUS)

**What goes wrong:** Chart A fires `setExtremes` → handler calls `setExtremes` on Chart B → Chart B fires `setExtremes` → handler calls `setExtremes` on Chart A → infinite loop → browser tab hangs.

**Why it happens:** `axis.setExtremes()` always fires `xAxis.events.setExtremes` on the axis that received the call, regardless of whether the call was programmatic or user-initiated. There is no "silent" mode.

**How to avoid:** The 5th `eventArguments` parameter to `setExtremes` becomes `e` in the event handler. Pass `{ trigger: 'syncExtremes' }` always. In the handler, check `if (e.trigger === 'syncExtremes') return;` as the FIRST line.

**Warning signs:** Browser tab becomes unresponsive immediately after any zoom action. Chrome's task manager shows CPU at 100%. Dev tools shows stack overflow in Highcharts internals.

**Verified source:** `highcharts.d.ts` line 187338: `setExtremes(min?, max?, redraw?, animation?, eventArguments?): void` — the 5th param `eventArguments` populates `e.trigger` in the fired event.

### Pitfall 2: `makeSetExtremesHandler` New Reference on Every Render

**What goes wrong:** `<ChartStrip onSetExtremes={makeSetExtremesHandler(chartId)} />` — `makeSetExtremesHandler` is called in JSX, creating a new function on every parent render. Highcharts' `useEffect` in `ChartStrip` sees a new `onSetExtremes` prop, re-runs its effect, re-attaches the listener, potentially calling `axis.setExtremes` mid-render.

**Why it happens:** In the `options` approach, Highcharts checks if options have changed between renders. A new function reference for `events.setExtremes` always registers as a change.

**How to avoid:** Compute handlers outside JSX using `useMemo` keyed by chart ID:
```typescript
const latencyHandler = useMemo(
  () => makeSetExtremesHandler(CHART_IDS.latency),
  [makeSetExtremesHandler]
);
```

### Pitfall 3: Chart Instance Not Available Immediately in `useEffect`

**What goes wrong:** `ChartStrip` calls `registerChart(chartId, chartRef.current.chart)` in a `useEffect`, but `chartRef.current` is null because `@highcharts/react` hasn't created the chart yet.

**Why it happens:** React's `useEffect` runs top-down for children. Both `ChartStrip`'s registration effect and `@highcharts/react`'s chart-creation effect run after the same render. The order depends on which effect is registered first within the same render cycle.

**How to avoid:** Use `chart.events.load` callback in the `options` object instead of `useEffect` for registration. The `load` event fires after Highcharts finishes creating the chart, before the first paint — guaranteed timing:
```typescript
chart: {
  events: {
    load(this: Highcharts.Chart) {
      registerChart(chartId, this);
    }
  }
}
```

**Warning signs:** `chartRef.current?.chart` is `undefined` when `registerChart` is called. TypeError in the first zoom attempt because the registry is empty.

### Pitfall 4: `setExtremes(undefined, undefined)` vs `setExtremes(null, null)` for Reset

**What goes wrong:** Passing `null` instead of `undefined` to reset causes Highcharts to treat `null` as `0` (explicit minimum of zero, not auto-computed). The chart snaps to `xAxis.min = 0` (epoch 0 = January 1, 1970).

**Why it happens:** Highcharts TypeScript signature is `min?: (number|string)` — `undefined` means "use auto-computed value"; `null` is coerced to `0`.

**How to avoid:** Always call `axis.setExtremes(undefined, undefined, true, false, { trigger: 'syncExtremes' })` for reset. Do not pass `null`.

**Warning signs:** After clicking Reset Zoom, all charts display 1970 on the x-axis.

### Pitfall 5: `StockChart` Navigator/ScrollBar Interfering with Zoom Sync

**What goes wrong:** `StockChart` renders a Highstock Navigator (the mini-chart below the main chart) and a scrollbar by default. The Navigator fires its own `setExtremes` events with `trigger: 'navigator'`. Without guards, these propagate to all other charts.

**Why it happens:** Highstock's Navigator is designed for single-chart use and fires axis events freely.

**How to avoid:** Disable the Navigator and scrollbar in `ChartStrip`'s options:
```typescript
navigator: {enabled: false},
scrollbar: {enabled: false},
rangeSelector: {enabled: false},
```

Additionally, the `SYNC_TRIGGER` guard only blocks `'syncExtremes'` — navigator events with `trigger: 'navigator'` would still propagate. If Navigator is left enabled, extend the guard:
```typescript
if (e.trigger === SYNC_TRIGGER || e.trigger === 'navigator') return;
```
But the simplest fix is disabling the Navigator entirely, which is the right choice for the chart strip pattern.

### Pitfall 6: MUI Slider Range Value Format

**What goes wrong:** MUI Slider throws a type error when `value` is not in the right format for a range slider.

**Why it happens:** MUI Slider accepts `number` (single-thumb) or `[number, number]` (two-thumb range). Passing `[null, null]` or `[undefined, undefined]` throws.

**How to avoid:** Always provide valid number pairs:
```typescript
const sliderValue: [number, number] = zoomedRange
  ? [zoomedRange.min, zoomedRange.max]
  : [timeRange.start, timeRange.end];
```
Never pass nullish values to `value`. When `zoomedRange === null`, fall back to the full `timeRange`.

---

## Code Examples

All patterns sourced from installed node_modules and TypeScript definitions.

### Complete `setExtremes` Sync Handler (Source: highcharts.d.ts line 187338)

```typescript
// xAxis.events.setExtremes handler — the feedback-loop guard in full
const handleSetExtremes = (e: Highcharts.AxisSetExtremesEventObject) => {
  // Guard: if trigger is 'syncExtremes', this call originated from our own
  // propagation — do not re-propagate (infinite loop prevention).
  if (e.trigger === 'syncExtremes') return;

  const {min, max} = e;

  // Write to Zustand — drives MUI Slider range
  setZoomedRange(
    min !== undefined && max !== undefined ? {min, max} : null
  );

  // Iterate registry and sync all other charts
  chartRegistryRef.current.forEach((chart, id) => {
    if (id === ownChartId) return;
    chart.xAxis[0].setExtremes(
      min,      // 1st param: new min (number | undefined)
      max,      // 2nd param: new max (number | undefined)
      true,     // 3rd param: redraw immediately
      false,    // 4th param: no animation (snap feels instant)
      {trigger: 'syncExtremes'}  // 5th param: eventArguments → e.trigger in receiver
    );
  });
};
```

### Accessing Chart Instance via @highcharts/react Ref (Source: @highcharts/react/Highcharts.js line 381)

```typescript
// The ref exposes { chart: Highcharts.Chart, container: HTMLDivElement }
// Source: HighchartsReactRefObject type in @highcharts/react/Stock.d.ts

import {useRef} from 'react';
import type {HighchartsReactRefObject} from '@highcharts/react/Stock';

const chartRef = useRef<HighchartsReactRefObject>(null);

// Access chart instance
const chartInstance = chartRef.current?.chart; // Highcharts.Chart | undefined

// Pass to StockChart
<StockChart ref={chartRef} options={...} />
```

### Enabling Zoom in Highcharts v12 (Source: ChartZoomingOptions in highcharts.d.ts line 7631)

```typescript
// Current API (v12) — use zooming.type, not zoomType
const options: Highcharts.Options = {
  chart: {
    zooming: {
      type: 'x',
      resetButton: {theme: {display: 'none'}}  // disable Highcharts built-in reset button
    }
  }
};
```

### Reset All Charts (Source: axis.setExtremes signature, highcharts.d.ts line 187338)

```typescript
// Reset: pass undefined (not null) for min and max
// undefined → Highcharts auto-computes extremes from data
// null      → treated as 0 (epoch 0 = 1970-01-01) — WRONG
chartRegistryRef.current.forEach(chart => {
  chart.xAxis[0].setExtremes(
    undefined,  // min: restore auto
    undefined,  // max: restore auto
    true,
    false,
    {trigger: 'syncExtremes'}
  );
});
setZoomedRange(null);  // clear Zustand → MUI Slider returns to full range
```

### StockChart with XAxis Events via options prop

```typescript
// Two approaches — both valid, approach A is simpler for Phase 2

// Approach A: options prop (recommended for Phase 2)
<StockChart
  ref={chartRef}
  options={{
    xAxis: {
      events: {
        setExtremes: handleSetExtremes  // Highcharts.AxisSetExtremesEventCallbackFunction
      }
    }
  }}
/>

// Approach B: XAxis component child (declarative)
import {XAxis} from '@highcharts/react/options';
<StockChart ref={chartRef}>
  <XAxis events={{setExtremes: handleSetExtremes}} />
</StockChart>
```

Both approaches are equivalent at runtime. The `options` prop is simpler for Phase 2 since all chart config is in one place.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `chart.zoomType: 'x'` | `chart.zooming: { type: 'x' }` | Highcharts v10+ | Old `zoomType` still works in v12 but is deprecated; use `zooming.type` |
| `highcharts-react-official` | `@highcharts/react` | Nov 2024 (HC v12) | New wrapper uses component-based API; old options-object `options={...}` prop still works via `options` prop on new wrapper |
| Options-object API (`<HighchartsReact options={...}>`) | Component-based API (`<Chart><Series/></Chart>`) | `@highcharts/react` v4 | Both APIs coexist; `options` prop is still supported for chart-level config |
| `useRef<HTMLDivElement>` + `new Highcharts.Chart()` | `<StockChart ref={chartRef}>` | `@highcharts/react` v4 | Wrapper handles chart lifecycle; `ref.current.chart` gives the instance |

**Deprecated/outdated:**
- `chart.zoomType`: Still runtime-valid in v12 but deprecated; `chart.zooming.type` is the documented path.
- `highcharts-react-official` npm package: Do not install or import. `@highcharts/react` is the replacement.

---

## Open Questions

1. **`chart.events.load` vs `useEffect` for chart registration**
   - What we know: `@highcharts/react` creates the chart in its own `useEffect`; our `useEffect` runs in the same render cycle.
   - What's unclear: Exact execution order of multiple `useEffect` calls in the same render between parent and child.
   - Recommendation: Use `chart.events.load` callback in `options` for registration — it is guaranteed to fire after chart creation regardless of React's effect scheduling.

2. **StockChart Navigator events and `trigger` values**
   - What we know: Navigator fires `setExtremes` with `trigger: 'navigator'`. We plan to disable Navigator entirely.
   - What's unclear: Whether disabling Navigator via `navigator: {enabled: false}` fully suppresses all navigator-originated `setExtremes` events.
   - Recommendation: Disable Navigator AND add a secondary guard for `'navigator'` trigger as a safety net: `if (e.trigger === SYNC_TRIGGER || e.trigger === 'navigator') return;`.

3. **`@highcharts/react` and React 19 compatibility**
   - What we know: The package.json says `"react": "^19.2.5"` is installed. `@highcharts/react` v4.2.1 README states `forwardRef` will be removed in "React v20+" — implying it works with React 19. The `Highcharts.js` source uses `forwardRef` which is still present in React 19.
   - What's unclear: Whether any React 19 concurrent mode behavior affects the chart creation timing in the wrapper's `useEffect`.
   - Recommendation: Proceed with current setup. If chart registration timing issues appear, fall back to `chart.events.load` (see Open Question 1).

---

## Environment Availability

All dependencies are installed. No new packages required for Phase 2.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@highcharts/react` | ChartStrip component | Yes | 4.2.1 | — |
| `highcharts` | Chart rendering | Yes | ^12.6.0 | — |
| `zustand` | `useTailHistoryStore` | Yes | ^5.0.13 | — |
| `@mui/material` (Slider) | ZoomControls | Yes | ^6.5.0 | — |
| `uuid` | Stable chart IDs | Yes | ^14.0.0 | — |
| `vitest` | Tests | Yes | ^4.1.5 | — |
| `@testing-library/react` | Component tests | Yes | ^16.3.2 | — |

**No missing dependencies.** Phase 2 is purely frontend — no backend API calls.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 + @testing-library/react 16.3.2 |
| Config file | `tail-history/vite.config.ts` (vitest config embedded) |
| Quick run command | `npx vitest run --reporter=verbose` (from `tail-history/` directory) |
| Full suite command | `npx vitest run --coverage` (from `tail-history/` directory) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ZOOM-01 | `ChartStrip` renders with `chart.zooming.type = 'x'` and passes options to Highcharts | unit | `npx vitest run src/__tests__/ChartStrip.test.tsx -t "zooming"` | No — Wave 0 |
| ZOOM-02 | `useChartSync.makeSetExtremesHandler`: non-syncExtremes trigger propagates to other charts; syncExtremes trigger is swallowed (no propagation) | unit | `npx vitest run src/__tests__/useChartSync.test.ts` | No — Wave 0 |
| ZOOM-03 | `ZoomControls` slider `value` updates to `[zoomedRange.min, zoomedRange.max]` when `zoomedRange` is non-null in the store | unit | `npx vitest run src/__tests__/ZoomControls.test.tsx -t "slider"` | No — Wave 0 |
| ZOOM-04 | `ZoomControls` Reset Zoom button calls `onResetZoom` prop; `setZoomedRange(null)` restores slider to full range | unit | `npx vitest run src/__tests__/ZoomControls.test.tsx -t "reset"` | No — Wave 0 |

### Vitest Mock Strategy for Highcharts

Highcharts chart instances are DOM-heavy and cannot instantiate in jsdom. The mock strategy:

```typescript
// In test files — mock @highcharts/react/Stock at the module level
import {vi} from 'vitest';

// Mock the entire StockChart component
vi.mock('@highcharts/react/Stock', () => ({
  default: vi.fn().mockImplementation(({options, ref}) => {
    // Simulate chart creation — call load event if options.chart.events.load exists
    if (options?.chart?.events?.load) {
      const mockChart = {
        xAxis: [{
          setExtremes: vi.fn()
        }],
        destroy: vi.fn()
      };
      // Assign to ref if provided
      if (ref && typeof ref === 'object' && ref !== null) {
        (ref as any).current = {chart: mockChart, container: document.createElement('div')};
      }
      // Fire load callback
      options.chart.events.load.call(mockChart);
    }
    return null; // render nothing in jsdom
  }),
  StockChart: vi.fn(() => null),
  StockSeries: vi.fn(() => null)
}));
```

**For `useChartSync` unit tests:** No Highcharts mock needed. The hook only operates on the `chartRegistryRef` Map and the `setExtremes` method of chart instances. Mock chart instances directly:

```typescript
// src/__tests__/useChartSync.test.ts
import {renderHook, act} from '@testing-library/react';
import {useRef} from 'react';
import {useChartSync, SYNC_TRIGGER} from '../hooks/useChartSync';

it('does not propagate when trigger is syncExtremes', () => {
  const mockSetExtremes = vi.fn();
  const mockChart = {xAxis: [{setExtremes: mockSetExtremes}]};

  const {result} = renderHook(() => {
    const registryRef = useRef(new Map([['chart-A', mockChart as any]]));
    return useChartSync(registryRef);
  });

  const handler = result.current.makeSetExtremesHandler('chart-A');

  // Fire with syncExtremes trigger — should be swallowed
  act(() => {
    handler({trigger: SYNC_TRIGGER, min: 100, max: 200} as any);
  });

  expect(mockSetExtremes).not.toHaveBeenCalled();
});

it('propagates to other charts when trigger is user zoom', () => {
  const mockSetExtremesA = vi.fn();
  const mockSetExtremesB = vi.fn();
  const registry = new Map([
    ['chart-A', {xAxis: [{setExtremes: mockSetExtremesA}]} as any],
    ['chart-B', {xAxis: [{setExtremes: mockSetExtremesB}]} as any]
  ]);

  const {result} = renderHook(() => {
    const registryRef = useRef(registry);
    return useChartSync(registryRef);
  });

  const handler = result.current.makeSetExtremesHandler('chart-A');

  act(() => {
    handler({trigger: 'zoom', min: 100, max: 200} as any);
  });

  // Chart A (self) should NOT receive setExtremes
  expect(mockSetExtremesA).not.toHaveBeenCalled();
  // Chart B should receive setExtremes with syncExtremes trigger
  expect(mockSetExtremesB).toHaveBeenCalledWith(100, 200, true, false, {trigger: 'syncExtremes'});
});
```

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/useChartSync.test.ts` — covers ZOOM-02 (feedback loop guard — most critical test in phase)
- [ ] `src/__tests__/ZoomControls.test.tsx` — covers ZOOM-03 (slider range update) + ZOOM-04 (reset zoom)
- [ ] `src/__tests__/ChartStrip.test.tsx` — covers ZOOM-01 (zoom enabled, chart renders, registration)
- [ ] `src/hooks/useChartSync.ts` — the hook itself (test cannot pass without implementation)
- [ ] `src/components/ChartStrip/ChartStrip.tsx` — component (test cannot pass without implementation)
- [ ] `src/pages/tailHistory/ZoomControls.tsx` — component (test cannot pass without implementation)

No framework changes needed — Vitest, @testing-library/react, and jsdom are already installed and configured.

---

## Sources

### Primary (HIGH confidence)

- `tail-history/node_modules/highcharts/highcharts.d.ts` — Read directly. Key findings:
  - `axis.setExtremes(min, max, redraw, animation, eventArguments)` signature at line 187338
  - `AxisSetExtremesEventObject.trigger: string | AxisExtremesTriggerValue` at line 5321
  - `SelectEventObject` type and `chart.events.selection` at lines 6032, 169370
  - `ChartZoomingOptions.type` at lines 6481, 7631–7694 (confirmed `zooming.type` is the current API)
  - `AxisExtremesTriggerValue` enum at line 186 (confirms 'syncExtremes' is not a built-in trigger value)
- `tail-history/node_modules/@highcharts/react/Highcharts.d.ts` — Read directly. Confirms:
  - `HighchartsReactRefObject.chart: Highcharts.Chart` interface
  - `ICommonAttributes.options?: HighchartsOptionsType` prop
  - `forwardRef` pattern with `useImperativeHandle` at line 381 of `Highcharts.js`
- `tail-history/node_modules/@highcharts/react/Stock.d.ts` — Read directly. Confirms:
  - `StockChart` is `forwardRefExoticComponent` with same `ICommonAttributes` interface
  - Import path `@highcharts/react/Stock`
- `tail-history/node_modules/@highcharts/react/options/XAxis.d.ts` — Read directly. Confirms:
  - `XAxisProps.events.setExtremes?: Highcharts.AxisSetExtremesEventCallbackFunction`
- `tail-history/src/pages/tailHistory/TailHistoryPage.tsx` — Read directly. Confirms:
  - `chartRegistryRef`, `registerChart`, `unregisterChart` exist and are ready for Phase 2 wiring
- `tail-history/src/pages/tailHistory/tailHistoryStore.ts` — Read directly. Confirms:
  - `zoomedRange: ZoomedRange | null` slice exists with `setZoomedRange` action
  - `ZoomedRange` interface: `{ min: number; max: number }` (epoch ms)
- `tail-history/vite.config.ts` — Read directly. Confirms Vitest configuration.
- `tail-history/src/setupTests.ts` — Read directly. Confirms CSS.supports polyfill for Highcharts v12 in jsdom.
- `tail-history/package.json` — Read directly. Confirms all dependencies installed; notes React 19.2.5 (not 18).

### Secondary (MEDIUM confidence)

- `tail-history/node_modules/@highcharts/react/README.md` — Official package documentation confirming component-based API and `<Chart>/<Series>` pattern.

---

## Metadata

**Confidence breakdown:**
- Zoom sync pattern (setExtremes guard): HIGH — verified from TypeScript definitions in installed node_modules; exact method signature confirmed
- @highcharts/react ref access: HIGH — read directly from `Highcharts.js` source (forwardRef + useImperativeHandle implementation)
- ChartStrip architecture: HIGH — derived directly from confirmed API surface and existing Phase 1 patterns
- MUI Slider wiring: HIGH — standard MUI Slider API, confirmed from installed MUI package
- Test mock strategy: MEDIUM — Vitest mock pattern for Highcharts is a standard approach, but specific interactions with @highcharts/react v4 in jsdom should be verified during Wave 0

**Research date:** 2026-05-05
**Valid until:** 2026-08-05 (Highcharts 12 and @highcharts/react 4.x are stable; React 19 is GA)
