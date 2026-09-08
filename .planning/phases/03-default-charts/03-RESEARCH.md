# Phase 3: Default Charts - Research

**Researched:** 2026-05-05
**Domain:** Highcharts x-range series, MUI Skeleton, mock data patterns, per-chart specification
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Build all 8 charts against typed TypeScript mock data stubs — each chart defines its own interface and a mock hook that returns synthetic data. Real `useFetch` calls are swapped in once backend provides endpoint contracts. No placeholder API URLs in Phase 3 code.
- **D-02:** CHART-07 (Usage) — 1 combined chart strip with 3 series: Download Usage, Upload Usage, and Cumulative Usage plotted together as separate colored lines.
- **D-03:** CHART-08 (Beam & Antenna) — Separate chart strips for each metric. Exact count and ordering follows Figma node 530-51991. See Open Questions for Figma access status.
- **D-04:** While a chart is fetching, show an MUI Skeleton block at the same height as the chart strip. No spinner, no layout shift.
- **D-05:** When there is no data for the selected tail and time range, show an inline message centered inside the chart strip: "No data available for this period." Chart strip remains visible (not hidden).
- **D-06:** Use standard colors (green/amber/red from Viasat theme) as placeholders in `colors.ts` for Phase 3. Exact Figma hex values for `RAG_CONNECTED`, `RAG_ACQUIRING`, `RAG_DISCONNECTED` will be swapped before Phase 3 browser verification. Colors already exist in `colors.ts` as placeholders.

### Claude's Discretion

- Error state (failed fetch): Claude to decide appropriate error treatment (likely matches empty state pattern with an error message variant).
- ChartStrip wrapper pattern for data-fetching charts: each chart gets a thin wrapper component that calls its mock hook and passes `series` to the existing `ChartStrip`.
- Chart ordering on page (top to bottom): follow Figma design node 310-148332. (Figma not accessible via MCP — see Open Questions. Use REQUIREMENTS.md ordering as fallback.)
- Zoom sync wiring: all charts use the existing `useChartSync` / `ChartStrip` / `chartRegistryRef` pattern from Phase 2.

### Deferred Ideas (OUT OF SCOPE)

- Real API integration (replacing mock stubs with `useFetch` calls) — deferred to a future task once backend endpoint contracts are available. It is a swap-in within the existing chart hooks, not a new phase.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHART-01 | Events Timeline: gantt-style colored bars for connectivity states (Disconnected/Acquiring/Connected/Network Change/Timing Events) | x-range series config, categories, color-per-point confirmed |
| CHART-02 | iQe Score: multiple line series (iQe Score, Download Perf, Upload Perf, Network Availability, Signal Strength, Beam Transition, Transmission Resilience, Month-to-date WPS) | 8 line series mock pattern defined |
| CHART-03 | Service Availability & CIR Satisfaction: Service Availability %, CIR Downstream Sat %, CIR Upstream Sat % | 3 bounded-percent line series, mock pattern defined |
| CHART-04 | CIR Fulfillment: actual bandwidth vs committed information rate (upstream and downstream) | 4-series dual-lane pattern, mock pattern defined |
| CHART-05 | Traffic Composition: stacked area by type | Highcharts `type: 'area'` with `stacking: 'normal'` confirmed; 4 series |
| CHART-06 | Latency & Packet Loss: latency (avg, min, max) + packet loss % | Already mocked in Phase 2 — extend with 3 latency series |
| CHART-07 | Download/Upload/Cumulative Usage in 1 combined strip | D-02 locked; 3 line series |
| CHART-08 | Beam & Antenna metrics: separate strips per Figma | Strip breakdown confirmed from REQUIREMENTS.md + PROJECT.md; Figma exact hex values deferred |
</phase_requirements>

---

## Summary

Phase 3 builds 8 default chart components — each a thin wrapper calling a typed mock hook and rendering through the existing `ChartStrip` component with `useChartSync` zoom wiring. Seven charts are `line` or `area` series; CHART-01 (Events Timeline) is the outlier requiring the `highcharts/modules/xrange` module for gantt-style horizontal bars colored by connectivity state.

The existing codebase (Phase 2) provides everything needed: `ChartStrip` accepts `series: Highcharts.SeriesOptionsType[]`, `useChartSync` returns per-chart `makeSetExtremesHandler`, and `TailHistoryPage` holds `chartRegistryRef`. Phase 3 replaces the two placeholder mock strips (Latency, Packet Loss) with properly structured chart wrapper components for all 8 charts, and adds loading (MUI Skeleton) and empty state handling that ChartStrip does not currently provide — so ChartStrip receives a small extension or each chart wrapper conditionally renders Skeleton vs ChartStrip.

The mock data pattern (LCG seeded random walk from `chartData.ts`) is already established and must be replicated per-chart with appropriate min/max value ranges.

**Primary recommendation:** Build 8 chart wrapper components, one mock hook per chart, extend ChartStrip to accept an `isLoading` + `isEmpty` prop (or handle conditionally in wrappers), import `highcharts/modules/xrange` in `main.tsx` for CHART-01 only.

---

## Project Constraints (from CLAUDE.md)

| Directive | Enforcement in Phase 3 |
|-----------|------------------------|
| Copyright header on every source file | Every new `.tsx` / `.ts` file gets `© 2026 Viasat, Inc.` header |
| MUI v6 — do NOT upgrade | Skeleton from `@mui/material/Skeleton` (v6 confirmed installed) |
| Highcharts 12.x + `@highcharts/react` 4.2.1 | Already installed; add `xrange` module import only |
| No hardcoded hex — import from `colors.ts` | RAG colors already in `colors.ts` as placeholders |
| Emotion `styled()` — no CSS modules | Wrappers use `styled(Box)` for empty/error state overlay |
| Zustand only (`useTailHistoryStore`) | `timeRange` from store drives mock hook data range |
| No raw `fetch` or axios | Phase 3 uses mock hooks only; no data fetching in code |
| Vitest test per component | Each of the 8 chart wrappers gets a `.test.tsx` |

---

## Standard Stack

### Core (all already installed — confirmed in `tail-history/package.json`)

| Library | Installed Version | Purpose | Why |
|---------|------------------|---------|-----|
| `highcharts` | 12.6.0 | Chart engine | Ecosystem constraint |
| `@highcharts/react` | 4.2.1 | React wrapper | Official wrapper; StockChart used |
| `highcharts/modules/xrange` | bundled with 12.6.0 | X-range series for Events Timeline | In core license; confirmed at `node_modules/highcharts/modules/xrange.js` |
| `@mui/material` | 6.5.0 | Skeleton for loading state | Ecosystem constraint; Skeleton available |
| `zustand` | 5.0.13 | Store access in mock hooks | Ecosystem constraint |

### No new packages required

All dependencies for Phase 3 are already installed. The only new import is `highcharts/modules/xrange` which is already on disk inside the installed `highcharts` package.

**Version verification (live npm registry):**
- `highcharts`: registry latest = 12.6.0 — matches installed
- `@highcharts/react`: registry latest = 4.2.1 — matches installed
- `@mui/material`: registry latest = 9.0.0 — project deliberately pins v6.5.0 (ecosystem constraint)

---

## Architecture Patterns

### Chart Component Pattern (applies to all 8 charts)

Each chart is a two-file module:

```
src/
├── components/
│   └── ChartStrip/
│       ├── ChartStrip.tsx          (existing — no changes needed for most charts)
│       └── ChartStrip.types.ts     (existing — no changes)
├── pages/
│   └── tailHistory/
│       ├── TailHistoryPage.tsx     (extended — all 8 chart IDs, handlers added)
│       ├── __mocks__/
│       │   └── chartData.ts        (extended — mock generators for all 8 charts)
│       └── charts/                 (NEW folder)
│           ├── EventsTimeline/
│           │   ├── EventsTimeline.tsx         (chart wrapper component)
│           │   ├── useEventsTimelineMock.ts   (typed mock hook)
│           │   └── EventsTimeline.test.tsx    (Vitest)
│           ├── IqeScore/
│           │   ├── IqeScore.tsx
│           │   ├── useIqeScoreMock.ts
│           │   └── IqeScore.test.tsx
│           ├── ServiceAvailability/
│           ├── CirFulfillment/
│           ├── TrafficComposition/
│           ├── LatencyPacketLoss/
│           ├── UsageChart/
│           └── BeamAntenna/
```

### Pattern 1: Chart Wrapper Component

Each wrapper component:
1. Calls its mock hook (`useFoo`) to get `{ series, isLoading, isEmpty }`
2. If `isLoading`: renders `<Skeleton variant="rectangular" width="100%" height={height} />`
3. If `isEmpty`: renders a styled `<ChartStrip>` with an overlay message OR replaces the StockChart with a centered `<Typography>` inside the strip container
4. Otherwise: renders `<ChartStrip chartId={...} title={...} series={series} ... />`

```typescript
// Source: Phase 2 established pattern + MUI Skeleton docs
// Pattern for every chart wrapper — e.g., IqeScore.tsx
import {useMemo} from 'react';
import {v4 as uuidv4} from 'uuid';
import {Skeleton} from '@mui/material';
import {Box, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import ChartStrip from '../../components/ChartStrip/ChartStrip';
import {useIqeScoreMock} from './useIqeScoreMock';
import {SURFACE_GREY, WHITE} from '../../theme/colors';

const CHART_HEIGHT = 200;
const CHART_ID = uuidv4(); // module scope — stable across renders

// EmptyStripContainer mirrors ChartStrip's StripContainer styling exactly
const EmptyStripContainer = styled(Box)({
  width: '100%',
  marginBottom: '16px',
  backgroundColor: WHITE,
  borderRadius: '4px',
  border: `1px solid ${SURFACE_GREY[200]}`,
  padding: '8px 16px',
  display: 'flex',
  flexDirection: 'column'
});

interface IqeScoreChartProps {
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart: (id: string) => void;
  onSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
}

const IqeScoreChart: React.FC<IqeScoreChartProps> = ({
  registerChart,
  unregisterChart,
  onSetExtremes
}) => {
  const {series, isLoading, isEmpty, error} = useIqeScoreMock();

  if (isLoading) {
    return (
      <EmptyStripContainer>
        <Skeleton variant="rectangular" width="100%" height={CHART_HEIGHT} />
      </EmptyStripContainer>
    );
  }

  if (isEmpty || error) {
    return (
      <EmptyStripContainer>
        <Typography variant="subtitle2" gutterBottom>iQe Score</Typography>
        <Box display="flex" alignItems="center" justifyContent="center" height={CHART_HEIGHT}>
          <Typography variant="body2" color="text.secondary">
            {error ? 'Failed to load data.' : 'No data available for this period.'}
          </Typography>
        </Box>
      </EmptyStripContainer>
    );
  }

  return (
    <ChartStrip
      chartId={CHART_ID}
      title="iQe Score"
      series={series}
      registerChart={registerChart}
      unregisterChart={unregisterChart}
      onSetExtremes={onSetExtremes}
      height={CHART_HEIGHT}
    />
  );
};

export default IqeScoreChart;
```

### Pattern 2: Mock Hook

Each mock hook returns `{ series, isLoading, isEmpty, error }`. It simulates async behavior with `useState` + `useEffect` delay:

```typescript
// Source: Phase 2 chartData.ts LCG pattern + mock hook pattern
// useIqeScoreMock.ts — representative example
import {useState, useEffect} from 'react';
import type Highcharts from 'highcharts/highstock';
import {
  PRIMARY_PURPLE,
  // ... other colors from colors.ts
} from '../../../theme/colors';
import {generateMockSeries} from '../../tailHistory/__mocks__/chartData';

export interface IqeScoreSeries {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export function useIqeScoreMock(): IqeScoreSeries {
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const series: Highcharts.SeriesOptionsType[] = [
    {type: 'line', name: 'iQe Score', data: generateMockSeries(10, 0, 100), color: PRIMARY_PURPLE},
    // ... 7 more series
  ];

  return {series: isLoading ? [] : series, isLoading, isEmpty, error: null};
}
```

### Pattern 3: TailHistoryPage Extension

All 8 chart IDs and handlers follow the same module-scope UUID + `useMemo` pattern already established:

```typescript
// Source: TailHistoryPage.tsx Phase 2 — extend this block
const EVENTS_TIMELINE_ID = uuidv4();
const IQE_SCORE_ID = uuidv4();
// ... 6 more

// Inside component:
const eventsTimelineHandler = useMemo(
  () => makeSetExtremesHandler(EVENTS_TIMELINE_ID),
  [makeSetExtremesHandler]
);
// ... 7 more
```

### Anti-Patterns to Avoid

- **Inline `uuidv4()` in JSX or inside component body:** Creates new ID on every render, breaking chart registry and zoom sync. IDs MUST be at module scope.
- **Inline `makeSetExtremesHandler(...)` in JSX:** Creates new function reference on every render, causing Highcharts to reattach event listeners. Must be memoized with `useMemo`.
- **Calling `xrange(Highcharts)` inside a component:** Module initialization is a side effect; call once in `main.tsx` before React renders.
- **Skeleton inside `ChartStrip`:** ChartStrip renders `StockChart` unconditionally. The loading/empty check must happen in the wrapper BEFORE rendering `ChartStrip`.
- **Importing `highcharts-gantt`:** Separate license. x-range series is in core license — confirmed present at `highcharts/modules/xrange.js`.

---

## Per-Chart Breakdown

### CHART-01: Events Timeline

**Title:** "Events Timeline"
**Requirement:** CHART-01
**Strip count:** 1
**Chart type:** `xrange` (from `highcharts/modules/xrange`)
**Height:** 160px (fewer categories, horizontal bars — shorter than line charts)

**Y-Axis categories (5 rows):**
| y index | Category Name | Color |
|---------|--------------|-------|
| 0 | Connected | `RAG_CONNECTED` (#00C853 placeholder) |
| 1 | Acquiring | `RAG_ACQUIRING` (#FFB300 placeholder) |
| 2 | Disconnected | `RAG_DISCONNECTED` (#E73737 placeholder) |
| 3 | Network Change | neutral (SURFACE_GREY[600]) |
| 4 | Timing Events | neutral (SURFACE_GREY[400]) |

**Data structure per point:**
```typescript
interface EventsTimelinePoint {
  x: number;    // start timestamp (epoch ms)
  x2: number;   // end timestamp (epoch ms)
  y: number;    // category index (0-4)
  color: string; // per-point color matching category
  name?: string; // label for tooltip
}
```

**Series config:**
```typescript
// Source: Highcharts docs (api.highcharts.com/highcharts/series.xrange) + xrange.d.ts
const series: Highcharts.SeriesOptionsType[] = [
  {
    type: 'xrange',
    name: 'Connectivity State',
    borderRadius: 3,
    pointWidth: 20,
    colorByPoint: true, // default true for xrange — each point uses its own color
    data: [
      {x: START_MS, x2: START_MS + 3600_000, y: 0, color: RAG_CONNECTED},
      {x: START_MS + 3600_000, x2: START_MS + 3660_000, y: 1, color: RAG_ACQUIRING},
      {x: START_MS + 3660_000, x2: START_MS + 7200_000, y: 2, color: RAG_DISCONNECTED},
      // ...
    ]
  }
];
```

**yAxis config:**
```typescript
yAxis: {
  title: {text: null},
  categories: ['Connected', 'Acquiring', 'Disconnected', 'Network Change', 'Timing Events'],
  reversed: false,
  min: 0,
  max: 4
}
```

**Module import (goes in `main.tsx`, before React renders):**
```typescript
// Source: Highcharts docs; xrange.js confirmed at highcharts/modules/xrange.js
import xrange from 'highcharts/modules/xrange';
import Highcharts from 'highcharts/highstock';

xrange(Highcharts); // initialize ONCE at app entry point
```

**Mock data strategy:** Generate deterministic segments — alternate between 3 connectivity states, each 30-90 min long, over the 14-day window. Add occasional Network Change (y=3) and Timing Event (y=4) points.

**ChartStrip caveat:** The existing `ChartStrip` uses `StockChart` with `xAxis.type: 'datetime'` and passes `series` straight through — this is compatible with xrange series. However, the `yAxis` in `ChartStrip` is currently `{title: {text: null}}` only. The Events Timeline needs `yAxis.categories` and `yAxis.min/max`. Since `ChartStrip` passes a single `chartOptions` object, the wrapper will need to either: (a) pass `yAxis` overrides through a new optional prop on `ChartStrip`, or (b) create a specialized `EventsTimelineStrip` variant that does not go through the generic `ChartStrip`. **Recommend option (a):** add an optional `yAxisOverride?: Highcharts.YAxisOptions` prop to `ChartStrip.types.ts`.

---

### CHART-02: iQe Score

**Title:** "iQe Score"
**Requirement:** CHART-02
**Strip count:** 1
**Chart type:** `line` (multiple series)
**Height:** 220px (8 series — slightly taller for legend readability)

**Series (8 line series):**
| # | Name | Range | Seed | Color |
|---|------|-------|------|-------|
| 1 | iQe Score | 0–100 | 10 | PRIMARY_PURPLE |
| 2 | Download Performance | 0–100 | 11 | BOLD_BLUE |
| 3 | Upload Performance | 0–100 | 12 | SUCCESS_GREEN* |
| 4 | Network Availability | 0–100 | 13 | WARNING_AMBER* |
| 5 | Signal Strength | -80–-40 dBm | 14 | ERROR_RED |
| 6 | Beam Transition | 0–10 (count) | 15 | SURFACE_GREY[600] |
| 7 | Transmission Resilience | 0–100 | 16 | SURFACE_GREY[400] |
| 8 | Month-to-date WPS | 0–1000 | 17 | PRIMARY_LIGHT_PURPLE |

*SUCCESS_GREEN and WARNING_AMBER need to be added to `colors.ts` or use nearest existing constants.

**Note from REQUIREMENTS.md:** "iQe Score, Download Performance, Upload Performance, Network Availability, Signal Strength, Beam Transition, Transmission Resilience, Month-to-date WPS" — 8 series confirmed.

**Legend:** Enable (`legend.enabled: true`) via ChartStrip options or override — currently disabled in ChartStrip. Either accept `legendEnabled?: boolean` prop or handle in wrapper. For 8 series, legend is essential.

---

### CHART-03: Service Availability & CIR Satisfaction

**Title:** "Service Availability & CIR Satisfaction"
**Requirement:** CHART-03
**Strip count:** 1
**Chart type:** `line`
**Height:** 200px

**Series (3 line series):**
| # | Name | Range | Seed | Color |
|---|------|-------|------|-------|
| 1 | Service Availability % | 0–100 | 20 | PRIMARY_PURPLE |
| 2 | CIR Downstream Sat % | 0–100 | 21 | BOLD_BLUE |
| 3 | CIR Upstream Sat % | 0–100 | 22 | ERROR_RED |

**yAxis:** Single axis, 0–100% range (add `yAxis.max: 100, yAxis.min: 0`).

---

### CHART-04: CIR Fulfillment

**Title:** "CIR Fulfillment"
**Requirement:** CHART-04
**Strip count:** 1
**Chart type:** `line`
**Height:** 200px

**Series (4 line series — actual vs committed, downstream and upstream):**
| # | Name | Range | Seed | Color |
|---|------|-------|------|-------|
| 1 | Downstream Actual (Mbps) | 0–100 | 30 | PRIMARY_PURPLE |
| 2 | Downstream Committed (Mbps) | 5–80 (flat-ish) | 31 | PRIMARY_LIGHT_PURPLE |
| 3 | Upstream Actual (Mbps) | 0–20 | 32 | BOLD_BLUE |
| 4 | Upstream Committed (Mbps) | 1–15 (flat-ish) | 33 | LIGHT_LIGHT_BLUE |

**Note:** "Committed" series should have smaller random walk step (low volatility — it represents a contract rate that changes infrequently). Adjust the random walk multiplier (e.g., `* 0.02` instead of `* 0.1`) for those series.

---

### CHART-05: Traffic Composition

**Title:** "Traffic Composition"
**Requirement:** CHART-05
**Strip count:** 1
**Chart type:** `area` with `stacking: 'normal'`
**Height:** 200px

**Series (4 stacked area series — traffic by type):**
| # | Name | Range | Seed | Color |
|---|------|-------|------|-------|
| 1 | Streaming | 0–50 (Mbps) | 40 | PRIMARY_PURPLE |
| 2 | Browsing | 0–30 | 41 | BOLD_BLUE |
| 3 | VoIP | 0–10 | 42 | SUCCESS_GREEN* |
| 4 | Other | 0–20 | 43 | SURFACE_GREY[400] |

**Series options:**
```typescript
{
  type: 'area',
  stacking: 'normal',
  name: 'Streaming',
  data: generateMockSeries(40, 0, 50),
  color: PRIMARY_PURPLE,
  fillOpacity: 0.7
}
```

**Note:** REQUIREMENTS.md says "stacked area showing traffic breakdown by type" — 4 traffic types chosen as representative. Exact category names are unknown without backend contract; these are reasonable placeholders.

---

### CHART-06: Latency & Packet Loss

**Title:** "Latency & Packet Loss"
**Requirement:** CHART-06
**Strip count:** 1
**Chart type:** `line`
**Height:** 200px

**Note:** Phase 2 already established `MOCK_LATENCY_SERIES` (1 series: Avg Latency) and `MOCK_PACKET_LOSS_SERIES` (1 series). Phase 3 replaces the Phase 2 placeholder strips with a proper `LatencyPacketLossChart` wrapper that has all 4 series combined in one strip.

**Series (4 line series):**
| # | Name | Range | Seed | Color |
|---|------|-------|------|-------|
| 1 | Avg Latency (ms) | 20–800 | 1 (reuse) | PRIMARY_PURPLE |
| 2 | Min Latency (ms) | 15–400 | 50 | SURFACE_GREY[400] |
| 3 | Max Latency (ms) | 50–1500 | 51 | SURFACE_GREY[600] |
| 4 | Packet Loss % | 0–15 | 2 (reuse) | ERROR_RED |

**Dual yAxis:** Latency (ms) on left yAxis[0], Packet Loss (%) on right yAxis[1]. This requires passing `yAxisIndex` per series and providing two yAxis configs. Another reason the `yAxisOverride` prop approach makes sense — or the chart uses a bespoke options object.

---

### CHART-07: Usage

**Title:** "Usage" (or "Download / Upload / Cumulative Usage")
**Requirement:** CHART-07
**Strip count:** 1 (D-02 locked)
**Chart type:** `line`
**Height:** 200px

**Series (3 line series — D-02 locked):**
| # | Name | Range | Seed | Color |
|---|------|-------|------|-------|
| 1 | Download Usage (GB) | 0–50 | 60 | PRIMARY_PURPLE |
| 2 | Upload Usage (GB) | 0–20 | 61 | BOLD_BLUE |
| 3 | Cumulative Usage (GB) | running sum — derive from Download + Upload | 62 | SURFACE_GREY[600] |

**Note:** Cumulative Usage is a running total — the mock generator should produce a monotonically increasing series. Strategy: generate Download and Upload series first, then compute cumulative as their running sum per timestamp.

---

### CHART-08: Beam & Antenna

**Requirement:** CHART-08
**Strip count:** MULTIPLE (D-03 — separate strips per Figma node 530-51991)

**Best available specification (from REQUIREMENTS.md + PROJECT.md — Figma not accessible):**

From `REQUIREMENTS.md`: "Beam & Antenna metrics charts render beam download, beam upload, forward link quality, return link quality, and antenna pointing data"

From `PROJECT.md` (Default Charts list): "Beam Download / Beam Upload" and "Antenna Pointing (Forward/Return Link Quality)"

**Inferred strip breakdown (3 strips):**

| Strip | Title | Series | Type | Height |
|-------|-------|--------|------|--------|
| 1 | "Beam Throughput" | Beam Download (Mbps), Beam Upload (Mbps) | line | 200px |
| 2 | "Link Quality" | Forward Link Quality, Return Link Quality | line | 200px |
| 3 | "Antenna Pointing" | Azimuth (deg), Elevation (deg) | line | 200px |

**IMPORTANT:** This is a research-based inference. Figma node 530-51991 is the authoritative source for exact strip titles, series names, and ordering. The Figma node was not accessible during this research (no Figma MCP available). See Open Questions #1.

**Mock data for strip 1 (Beam Throughput):**
| # | Name | Range | Seed |
|---|------|-------|------|
| 1 | Beam Download (Mbps) | 0–150 | 70 |
| 2 | Beam Upload (Mbps) | 0–30 | 71 |

**Mock data for strip 2 (Link Quality):**
| # | Name | Range | Seed |
|---|------|-------|------|
| 1 | Forward Link Quality | 0–100 | 72 |
| 2 | Return Link Quality | 0–100 | 73 |

**Mock data for strip 3 (Antenna Pointing):**
| # | Name | Range | Seed |
|---|------|-------|------|
| 1 | Azimuth (deg) | 0–360 | 74 |
| 2 | Elevation (deg) | 0–90 | 75 |

---

## Page Ordering (Top to Bottom)

**Authoritative source:** Figma node 310-148332 (not accessible via MCP — see Open Questions #1).

**Best available ordering from REQUIREMENTS.md declaration order + PROJECT.md:**

| Position | Chart | Component |
|----------|-------|-----------|
| 1 | Events Timeline | `EventsTimelineChart` |
| 2 | iQe Score | `IqeScoreChart` |
| 3 | Service Availability & CIR Satisfaction | `ServiceAvailabilityChart` |
| 4 | CIR Fulfillment | `CirFulfillmentChart` |
| 5 | Traffic Composition | `TrafficCompositionChart` |
| 6 | Latency & Packet Loss | `LatencyPacketLossChart` |
| 7 | Usage (Download/Upload/Cumulative) | `UsageChart` |
| 8a | Beam Throughput (strip 1 of CHART-08) | `BeamAntennaChart` (strip 1) |
| 8b | Link Quality (strip 2 of CHART-08) | `BeamAntennaChart` (strip 2) |
| 8c | Antenna Pointing (strip 3 of CHART-08) | `BeamAntennaChart` (strip 3) |

This ordering matches the REQUIREMENTS.md listing order (CHART-01 through CHART-08). Figma node 310-148332 must be consulted during implementation to confirm or correct this order.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gantt-style horizontal time bars | Custom SVG/canvas bars | `highcharts/modules/xrange` | Full-featured: tooltips, zoom, color-per-point, yAxis categories — all free with core license |
| Loading state animation | Custom CSS spinner | `<Skeleton variant="rectangular">` (MUI v6) | Already installed; prevents layout shift; matches MUI component visual language |
| Empty state detection | Backend response introspection | `data.length === 0` check in mock hook | Simple, testable, placeholder sufficient for Phase 3 |
| Zoom sync | Per-chart `useEffect` with window events | `useChartSync` + `chartRegistryRef` (Phase 2) | Already built and tested; do not duplicate |
| Color tokens | Hardcoded hex strings | `colors.ts` imports | CLAUDE.md constraint; RAG colors already in `colors.ts` |

**Key insight:** The xrange module does the heavy work for CHART-01 — do not attempt to recreate gantt-style bars with column series or custom renderers.

---

## x-Range Series: Complete Configuration Reference

**Module initialization (in `main.tsx`, once, before React renders):**
```typescript
// Source: Highcharts docs + node_modules/highcharts/modules/xrange.js confirmed v12.6.0
import Highcharts from 'highcharts/highstock';
import xrange from 'highcharts/modules/xrange';

// Initialize ONCE at module level — NOT inside a component
xrange(Highcharts);
```

**Why `main.tsx`:** Highcharts modules mutate the global Highcharts instance. Calling `xrange(Highcharts)` inside a component would run on every render. It must run once before any chart renders.

**Series type declaration:**
```typescript
// The type assertion is required because SeriesOptionsType does not include 'xrange'
// until the module is initialized. TypeScript augmentation from xrange.d.ts adds it.
const eventsSeries = [
  {
    type: 'xrange' as const,
    name: 'Connectivity State',
    colorByPoint: true,      // default: true — each point uses point.color
    borderRadius: 3,
    pointWidth: 20,          // bar height in px
    data: [
      {
        x: Date.UTC(2026, 3, 20, 0, 0),    // start (epoch ms)
        x2: Date.UTC(2026, 3, 20, 2, 30),  // end (epoch ms)
        y: 0,                               // category index
        color: RAG_CONNECTED
      },
      // ...
    ]
  }
] satisfies Highcharts.SeriesOptionsType[];
```

**yAxis override needed (Events Timeline only):**
```typescript
// EventsTimelineStrip must override ChartStrip's default yAxis
const eventsYAxis: Highcharts.YAxisOptions = {
  title: {text: null},
  categories: ['Connected', 'Acquiring', 'Disconnected', 'Network Change', 'Timing Events'],
  reversed: false,
  min: 0,
  max: 4
};
```

**ChartStrip extension needed:** Add optional `yAxisOptions?: Highcharts.YAxisOptions` prop (or `yAxisOverride`) to `ChartStrip.types.ts`. When provided, it replaces the default `{title: {text: null}}`. This avoids creating a one-off `EventsTimelineStrip` component.

**Data generation for Events Timeline mock:**
```typescript
// Deterministic: generate connected/acquiring/disconnected segments covering 14 days
function generateEventSegments(
  start: number,
  end: number
): Array<{x: number; x2: number; y: number; color: string}> {
  const segments = [];
  let cursor = start;
  let s = 99; // LCG seed
  const states = [
    {y: 0, color: RAG_CONNECTED, minMs: 30 * 60_000, maxMs: 4 * 3600_000},
    {y: 2, color: RAG_DISCONNECTED, minMs: 2 * 60_000, maxMs: 20 * 60_000},
    {y: 1, color: RAG_ACQUIRING, minMs: 30_000, maxMs: 5 * 60_000},
  ];
  while (cursor < end) {
    s = (s * 16807) % 2147483647;
    const stateIdx = s % 3;
    const state = states[stateIdx];
    s = (s * 16807) % 2147483647;
    const durationMs = state.minMs + (s / 2147483647) * (state.maxMs - state.minMs);
    const segEnd = Math.min(cursor + durationMs, end);
    segments.push({x: cursor, x2: segEnd, y: state.y, color: state.color});
    cursor = segEnd;
  }
  return segments;
}
```

---

## MUI Skeleton Integration Pattern

**Import (MUI v6 confirmed installed):**
```typescript
// Source: mui.com/material-ui/react-skeleton + installed @mui/material 6.5.0
import Skeleton from '@mui/material/Skeleton';
```

**Usage in chart wrapper — matches `ChartStrip` visual footprint exactly:**
```typescript
if (isLoading) {
  return (
    <EmptyStripContainer>   {/* mirrors ChartStrip's StripContainer */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={CHART_HEIGHT}   // same as height prop passed to ChartStrip
        animation="wave"        // wave feels more appropriate for data loading than pulse
      />
    </EmptyStripContainer>
  );
}
```

**Key constraint:** The Skeleton is inside a container that replicates `ChartStrip`'s `StripContainer` styling (`WHITE` background, `SURFACE_GREY[200]` border, `4px` border-radius, `8px 16px` padding, `16px` bottom margin). This prevents layout shift — the skeleton block occupies the exact same space the chart will occupy.

**Do NOT** render Skeleton inside `ChartStrip`. ChartStrip renders `StockChart` unconditionally. Loading checks happen in the wrapper before `ChartStrip` is reached.

---

## Mock Data Pattern (Established in Phase 2)

**Source:** `tail-history/src/pages/tailHistory/__mocks__/chartData.ts`

**LCG function signature (already exported):**
```typescript
// Already in chartData.ts — import this function into new mock files
function generateMockSeries(seed: number, min: number, max: number): [number, number][]
```

The function generates `~4032` points (14 days at 5-min intervals) using Park-Miller LCG:
- `s = (s * 16807 + 0) % 2147483647`
- `rand = s / 2147483647` → `[0, 1)`
- `value = clamp(value + (rand - 0.5) * (max - min) * 0.1, min, max)`

**Extension needed:** `generateMockSeries` is not currently exported from `chartData.ts` — it is an unexported module-scope function. Phase 3 mock hooks need to call it. Either:
1. Export it from `chartData.ts`: `export function generateMockSeries(...)`
2. Or duplicate the function in each mock hook (not recommended — violates DRY)

**Recommendation:** Export `generateMockSeries` from `chartData.ts` and import it into each mock hook.

**Per-chart seed assignments (to prevent identical random walks):**

| Chart | Series | Seed |
|-------|--------|------|
| Events Timeline | (uses segment generator, not LCG time series) | 99 |
| iQe Score | iQe Score | 10 |
| iQe Score | Download Performance | 11 |
| iQe Score | Upload Performance | 12 |
| iQe Score | Network Availability | 13 |
| iQe Score | Signal Strength | 14 |
| iQe Score | Beam Transition | 15 |
| iQe Score | Transmission Resilience | 16 |
| iQe Score | Month-to-date WPS | 17 |
| Service Availability | Service Availability % | 20 |
| Service Availability | CIR Downstream Sat % | 21 |
| Service Availability | CIR Upstream Sat % | 22 |
| CIR Fulfillment | DS Actual | 30 |
| CIR Fulfillment | DS Committed | 31 |
| CIR Fulfillment | US Actual | 32 |
| CIR Fulfillment | US Committed | 33 |
| Traffic Composition | Streaming | 40 |
| Traffic Composition | Browsing | 41 |
| Traffic Composition | VoIP | 42 |
| Traffic Composition | Other | 43 |
| Latency & PL | Avg Latency | 1 (reuse) |
| Latency & PL | Min Latency | 50 |
| Latency & PL | Max Latency | 51 |
| Latency & PL | Packet Loss | 2 (reuse) |
| Usage | Download | 60 |
| Usage | Upload | 61 |
| Usage | Cumulative | derived |
| Beam Throughput | Beam Download | 70 |
| Beam Throughput | Beam Upload | 71 |
| Link Quality | Forward LQ | 72 |
| Link Quality | Return LQ | 73 |
| Antenna Pointing | Azimuth | 74 |
| Antenna Pointing | Elevation | 75 |

---

## Common Pitfalls

### Pitfall 1: xrange Module Initialized Inside Component
**What goes wrong:** `xrange(Highcharts)` runs on every render, causing Highcharts internal state to be re-initialized. Chart may flicker or fail silently.
**Why it happens:** Developers place the module call near the import at the top of the component file, which runs in module scope — actually fine. But calling inside a component body is wrong.
**How to avoid:** Call `xrange(Highcharts)` in `main.tsx` alongside the existing `Highcharts.setOptions()` call — already the established pattern.
**Warning signs:** TypeScript error `Property 'xrange' does not exist on type 'SeriesRegistry'` until the module is initialized; chart renders blank without the module.

### Pitfall 2: Chart ID Inside Component Body
**What goes wrong:** `const CHART_ID = uuidv4()` inside the component function generates a new UUID on every render. The registry accumulates orphaned entries; zoom sync fires handlers for old IDs that no longer correspond to live charts.
**Why it happens:** Developer places UUID generation where they initialize other state.
**How to avoid:** `const CHART_ID = uuidv4()` at MODULE scope, outside all function/class bodies. Pattern already established in `TailHistoryPage.tsx`.
**Warning signs:** Zoom sync working intermittently; multiple registry entries per chart visible in devtools.

### Pitfall 3: makeSetExtremesHandler Not Memoized
**What goes wrong:** Highcharts xAxis event listener is reattached on every render, accumulating duplicate sync calls. One zoom triggers multiple sync events per chart.
**Why it happens:** Handler created inline in JSX: `onSetExtremes={makeSetExtremesHandler(CHART_ID)}`.
**How to avoid:** `useMemo(() => makeSetExtremesHandler(CHART_ID), [makeSetExtremesHandler])` in `TailHistoryPage`.
**Warning signs:** Zoom causes multiple simultaneous range updates; charts jumping instead of snapping.

### Pitfall 4: Skeleton Inside ChartStrip
**What goes wrong:** `ChartStrip` always renders `StockChart`. If you put Skeleton logic inside `ChartStrip`, you either have to pass `isLoading` through `ChartStrip` and add conditional logic, or the `StockChart` renders empty series which shows axes with no data — not a skeleton.
**Why it happens:** Developer modifies `ChartStrip` to "add loading state" rather than using the wrapper pattern.
**How to avoid:** Loading/empty checks happen in the chart wrapper component BEFORE rendering `ChartStrip`. `ChartStrip` stays pure — receives `series` and renders.
**Warning signs:** Empty axes visible during load instead of skeleton block.

### Pitfall 5: Missing `type: 'xrange' as const`
**What goes wrong:** TypeScript infers `type: 'xrange'` as `string`, which does not match `SeriesOptionsType`. Compilation error or runtime failure.
**Why it happens:** String literals need `as const` to narrow to their literal type in TypeScript.
**How to avoid:** Always use `type: 'xrange' as const` in the series object.

### Pitfall 6: Stacked Area Without `stacking: 'normal'`
**What goes wrong:** Area series overlap rather than stack. The chart looks like multiple overlapping areas instead of a composition breakdown.
**Why it happens:** `stacking` is a series-level option that defaults to `undefined` (no stacking).
**How to avoid:** Set `stacking: 'normal'` on every series in CHART-05.

### Pitfall 7: Phase 2 Placeholder Strips Not Removed
**What goes wrong:** Page shows both the old placeholder Latency/Packet Loss strips AND the new `LatencyPacketLossChart` wrapper — duplicating the chart and registering two chart IDs per chart.
**Why it happens:** Developer adds new chart wrappers but forgets to remove the Phase 2 placeholder `<ChartStrip ... series={MOCK_LATENCY_SERIES} />` blocks in `TailHistoryPage.tsx`.
**How to avoid:** When adding `LatencyPacketLossChart`, simultaneously remove the Phase 2 placeholder strips and their module-scope IDs (`LATENCY_CHART_ID`, `PACKET_LOSS_CHART_ID`).

---

## ChartStrip Extension Requirements

The existing `ChartStrip` component needs minor extension for Phase 3 (one small prop addition):

### Addition 1: `yAxisOptions` prop (for Events Timeline)

```typescript
// ChartStrip.types.ts addition
export interface ChartStripProps {
  // ... existing props ...
  /** Override the default yAxis config (Events Timeline uses categories) */
  yAxisOptions?: Highcharts.YAxisOptions;
  /** Additional yAxis instances (Latency & PL dual-axis) */
  yAxisAdditional?: Highcharts.YAxisOptions[];
  /** Enable chart legend (default: false) */
  legendEnabled?: boolean;
}
```

The `chartOptions` object in `ChartStrip.tsx` changes from:
```typescript
yAxis: {title: {text: null}}
```
to:
```typescript
yAxis: yAxisOptions ?? {title: {text: null}}
```

And legend from:
```typescript
legend: {enabled: false}
```
to:
```typescript
legend: {enabled: legendEnabled ?? false}
```

This is the minimum change to ChartStrip needed for Phase 3. Keep it backwards-compatible — all existing usages still work without the new props.

---

## Environment Availability

Phase 3 is a pure frontend code change — no external services, databases, or CLI tools beyond what's already confirmed working.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/test | Yes | v22.14.0 | — |
| Vitest | Testing | Yes | 4.1.5 (installed) | — |
| `highcharts/modules/xrange` | CHART-01 | Yes | bundled with 12.6.0 | — |
| `@mui/material/Skeleton` | D-04 loading state | Yes | 6.5.0 (installed) | — |
| Figma (node 530-51991, 310-148332) | CHART-08 strip count, page ordering | No MCP available | — | Use REQUIREMENTS.md ordering; flag for human review before browser-verify |

**Missing dependencies with no fallback:** None — all code dependencies confirmed.

**Missing dependencies with fallback:** Figma access — use REQUIREMENTS.md + PROJECT.md inferred spec; must be reviewed against Figma before Phase 3 browser verification step.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 |
| Config file | `tail-history/vite.config.ts` (embedded `test:` block) |
| Setup file | `tail-history/src/setupTests.ts` |
| Quick run command | `npx vitest run --reporter=verbose` (run from `tail-history/`) |
| Full suite command | `npx vitest run` |
| Current state | 8 test files, 40 tests — ALL PASSING (verified 2026-05-05) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHART-01 | EventsTimeline renders with xrange series, loading skeleton, empty state | unit | `npx vitest run --reporter=verbose src/__tests__/EventsTimeline.test.tsx` | Wave 0 |
| CHART-02 | IqeScoreChart renders title "iQe Score", loading skeleton, empty state | unit | `npx vitest run --reporter=verbose src/__tests__/IqeScore.test.tsx` | Wave 0 |
| CHART-03 | ServiceAvailabilityChart renders title, loading/empty states | unit | `npx vitest run --reporter=verbose src/__tests__/ServiceAvailability.test.tsx` | Wave 0 |
| CHART-04 | CirFulfillmentChart renders title, loading/empty states | unit | `npx vitest run --reporter=verbose src/__tests__/CirFulfillment.test.tsx` | Wave 0 |
| CHART-05 | TrafficCompositionChart renders with stacked area series | unit | `npx vitest run --reporter=verbose src/__tests__/TrafficComposition.test.tsx` | Wave 0 |
| CHART-06 | LatencyPacketLossChart renders title with 4 series, loading/empty states | unit | `npx vitest run --reporter=verbose src/__tests__/LatencyPacketLoss.test.tsx` | Wave 0 |
| CHART-07 | UsageChart renders with 3 series (Download/Upload/Cumulative) | unit | `npx vitest run --reporter=verbose src/__tests__/UsageChart.test.tsx` | Wave 0 |
| CHART-08 | BeamAntennaChart renders 3 strips with correct titles | unit | `npx vitest run --reporter=verbose src/__tests__/BeamAntenna.test.tsx` | Wave 0 |
| CHART-01..08 | All charts registered in chartRegistryRef in TailHistoryPage | unit | `npx vitest run --reporter=verbose src/__tests__/TailHistoryPage.test.tsx` | Exists (update needed) |

### Per-Chart Test Template

Every chart wrapper test follows this pattern (demonstrated with `IqeScore`):

```typescript
// Source: ChartStrip.test.tsx (established mock pattern) + TailHistoryPage.test.tsx
// IqeScore.test.tsx

import {vi, describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';

// Mock @highcharts/react/Stock — do not render real Highcharts in unit tests
vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(() => <div data-testid="mock-stockchart" />)
}));

// Mock the mock hook — unit test only cares about component behavior
const {mockUseIqeScoreMock} = vi.hoisted(() => ({
  mockUseIqeScoreMock: vi.fn()
}));
vi.mock('../pages/tailHistory/charts/IqeScore/useIqeScoreMock', () => ({
  useIqeScoreMock: mockUseIqeScoreMock
}));

import IqeScoreChart from '../pages/tailHistory/charts/IqeScore/IqeScore';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

describe('IqeScoreChart (CHART-02)', () => {
  it('renders chart title when data available', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: [{type: 'line', name: 'iQe Score', data: []}],
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<IqeScoreChart {...defaultProps} />);
    expect(screen.getByText('iQe Score')).toBeInTheDocument();
  });

  it('renders MUI Skeleton when isLoading is true', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<IqeScoreChart {...defaultProps} />);
    // Skeleton does not have a role — check that StockChart is NOT rendered
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders empty state message when data is empty', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<IqeScoreChart {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders error state message on fetch failure', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<IqeScoreChart {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
  });
});
```

**Key Vitest pattern decisions (from existing tests):**
- `vi.hoisted()` is required for mock factory variables that reference module-scope names
- Mock `@highcharts/react/Stock` globally — never render real StockChart in unit tests
- Each chart wrapper's mock hook is mocked — tests verify behavior, not hook internals
- `data-testid="mock-stockchart"` on the StockChart mock lets tests assert "chart rendered" vs "skeleton/empty rendered"

### Sampling Rate

- **Per task commit:** `npx vitest run src/__tests__/<chart>.test.tsx` (single file, ~2s)
- **Per wave merge:** `npx vitest run` (full suite, ~1min)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/EventsTimeline.test.tsx` — covers CHART-01
- [ ] `src/__tests__/IqeScore.test.tsx` — covers CHART-02
- [ ] `src/__tests__/ServiceAvailability.test.tsx` — covers CHART-03
- [ ] `src/__tests__/CirFulfillment.test.tsx` — covers CHART-04
- [ ] `src/__tests__/TrafficComposition.test.tsx` — covers CHART-05
- [ ] `src/__tests__/LatencyPacketLoss.test.tsx` — covers CHART-06
- [ ] `src/__tests__/UsageChart.test.tsx` — covers CHART-07
- [ ] `src/__tests__/BeamAntenna.test.tsx` — covers CHART-08
- [ ] `src/__tests__/TailHistoryPage.test.tsx` (exists — needs update) — verify all 8 chart components render in page

Framework install: NOT needed — Vitest 4.1.5 already installed and 40 tests passing.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `highcharts-react-official` | `@highcharts/react` 4.2.1 with `StockChart` from `@highcharts/react/Stock` | Highcharts 12 (Nov 2024) | Already using new wrapper — no action |
| Parallel arrays for series data | DataTable internally | Highcharts 12 | Transparent — series data still uses `data: [number, number][]` array format; DataTable is internal |
| `highcharts/highcharts` import | `highcharts/highstock` (StockChart requires this) | Phase 2 established | Already done — `main.tsx` imports from `highcharts/highstock` |

---

## Open Questions

### 1. Figma Access for CHART-08 and Page Ordering (HIGH PRIORITY)
- **What we know:** Figma nodes 530-51991 (chart examples) and 310-148332 (full page layout) are the authoritative sources for CHART-08 strip count/ordering and page chart ordering.
- **What's unclear:** Exact strip titles, series names, and top-to-bottom ordering. Research used REQUIREMENTS.md + PROJECT.md as fallback.
- **Recommendation:** Before the planner finalizes tasks, the user (Travis) should share Figma screenshots of nodes 310-148332 and 530-51991, OR the implementer should consult Figma before writing CHART-08 component titles/series names. The inferred breakdown (3 strips: Beam Throughput, Link Quality, Antenna Pointing) is a reasonable default but must be confirmed.

### 2. Legend Visibility Decision
- **What we know:** `ChartStrip` currently sets `legend.enabled: false`. Charts with 3–8 series need legend to be legible.
- **What's unclear:** Should legend always be enabled, or only for charts with ≥ 3 series?
- **Recommendation:** Add `legendEnabled?: boolean` prop to `ChartStrip`. Default `false` (backwards compatible). Explicitly pass `legendEnabled={true}` for CHART-02 (8 series), CHART-04 (4 series), CHART-05 (4 series), CHART-06 (4 series), CHART-07 (3 series), CHART-08 strips (2+ series). The 1-series charts (none in Phase 3) do not need legend.

### 3. Dual yAxis for Latency & Packet Loss
- **What we know:** Latency is in ms (0–1500), Packet Loss is in % (0–15). Single yAxis makes both series unreadable — they live at completely different scales.
- **What's unclear:** Whether to use dual yAxis (left = ms, right = %) or normalize both to unitless percentage.
- **Recommendation:** Use dual yAxis. Pass `yAxisAdditional` prop to extend ChartStrip. Latency series reference `yAxis: 0`, Packet Loss references `yAxis: 1`.

### 4. Color Constants for Missing Chart Colors
- **What we know:** `colors.ts` has `PRIMARY_PURPLE`, `BOLD_BLUE`, `ERROR_RED`, `SURFACE_GREY`, `PRIMARY_LIGHT_PURPLE`, `LIGHT_LIGHT_BLUE`. Phase 3 charts need a success green and warning amber.
- **What's unclear:** Whether to add new constants (`SUCCESS_GREEN`, `WARNING_AMBER`) or reuse `RAG_CONNECTED`/`RAG_ACQUIRING` as semantic proxies.
- **Recommendation:** Add `SUCCESS_GREEN` and `WARNING_AMBER` to `colors.ts` using the RAG placeholder values (`SUCCESS_GREEN = RAG_CONNECTED = '#00C853'`, `WARNING_AMBER = RAG_ACQUIRING = '#FFB300'`). Keeps semantic meaning separate from connectivity state meaning.

---

## Sources

### Primary (HIGH confidence)
- `tail-history/node_modules/highcharts/modules/xrange.js` — confirmed module exists at v12.6.0
- `tail-history/node_modules/highcharts/modules/xrange.d.ts` — TypeScript augmentation: `Point.x2`, `PointOptionsObject.x2` confirmed
- `tail-history/src/components/ChartStrip/ChartStrip.tsx` — props interface confirmed
- `tail-history/src/components/ChartStrip/ChartStrip.types.ts` — ChartStripProps interface confirmed
- `tail-history/src/pages/tailHistory/__mocks__/chartData.ts` — LCG seed pattern confirmed
- `tail-history/src/pages/tailHistory/TailHistoryPage.tsx` — module-scope UUID, useMemo handler pattern confirmed
- `.planning/REQUIREMENTS.md` — per-chart series names (authoritative, user-validated)
- `.planning/PROJECT.md` — CHART-08 strip breakdown (supplemental)
- `.planning/phases/03-default-charts/03-CONTEXT.md` — locked decisions (D-01 through D-06)
- `tail-history/package.json` — installed versions confirmed

### Secondary (MEDIUM confidence)
- Highcharts API docs (api.highcharts.com/highcharts/series.xrange) — x/x2/y/color data structure, colorByPoint default true
- Highcharts docs (highcharts.com/docs/chart-and-series-types/x-range-series) — module import, data structure
- MUI docs (mui.com/material-ui/react-skeleton) — Skeleton variant="rectangular", height prop, animation options
- Highcharts React docs (highcharts.com/docs/react/getting-started) — module initialization with `import 'highcharts/modules/xrange'` + function call pattern
- JSFiddle Highcharts x-range demo — yAxis.categories config, reversed: true/false, pointWidth usage

### Tertiary (LOW confidence)
- Page ordering (CHART-01 through CHART-08 top-to-bottom): inferred from REQUIREMENTS.md listing order — not confirmed against Figma node 310-148332
- CHART-08 strip breakdown (3 strips: Beam Throughput/Link Quality/Antenna Pointing): inferred from REQUIREMENTS.md + PROJECT.md — not confirmed against Figma node 530-51991
- Traffic Composition series names (Streaming/Browsing/VoIP/Other): placeholder names — backend contract unknown

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed, versions verified against npm registry
- Architecture patterns: HIGH — directly derived from existing Phase 2 code; ChartStrip pattern well-established
- x-range series config: HIGH — module confirmed in node_modules, API docs verified, JSFiddle demo reviewed
- MUI Skeleton: HIGH — confirmed installed, docs reviewed, pattern straightforward
- Mock data LCG pattern: HIGH — copied from existing `chartData.ts`, seed assignments are new but deterministic
- Per-chart series names: HIGH for CHART-01, 02, 03, 04, 06 (from REQUIREMENTS.md); MEDIUM for CHART-05, 07, 08
- CHART-08 strip breakdown: LOW — inferred, not confirmed from Figma
- Page ordering: LOW — inferred from REQUIREMENTS.md order, not confirmed from Figma

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (stable ecosystem — Highcharts 12.x, MUI 6.x not changing)
