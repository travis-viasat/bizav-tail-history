# IP History Chart Design

**Date:** 2026-05-12  
**Status:** Approved  
**Feature:** Reusable Gantt-style timeline component for IP address assignments, with standalone demo and Tail History integration

## Overview

The IP History chart displays three tracked IP addresses (Transmit, Receive, TPA) as a horizontal timeline, showing which IP was active for each role during each time period. This provides a visual record of IP assignment changes and their duration.

This is implemented as **two deliverables:**
1. **IP History Chart Package** — reusable React component, lives in its own repo, zero coupling to Tail History
2. **IP History Review App** — standalone demo for product/dev review, separate from both the package and Tail History
3. **Tail History Integration** — Tail History consumes the package as a dependency

## Data Model

### IP History Event
```typescript
interface IpHistoryEvent {
  role: 'Transmit' | 'Receive' | 'TPA';
  ipAddress: string;
  startTime: number;    // milliseconds since epoch
  endTime: number;      // milliseconds since epoch
}
```

### Mock Data
`useIpHistoryMock.ts` generates randomized IP history for demo purposes:
- 3–5 state changes per role over the selected date range
- Realistic IP addresses (obfuscated format: `xx.xxx.*.***`)
- Varying durations (some short, some spanning hours)
- No gaps or overlaps within a role (one IP per role at any given time)

## Visualization

### Highcharts Configuration
- **Chart Type:** xrange (Highcharts x-range series, included with core license)
- **Y-axis:** Three categories: `['Transmit', 'Receive', 'TPA']`
- **X-axis:** Time (datetime scale, matches other charts' synchronized zoom)
- **Series:** One xrange series containing all IP events
- **Bar Labels:** IP address displayed inside or adjacent to each bar
- **Tooltip:** On hover, shows:
  - Role name (e.g., "Transmit")
  - IP address (e.g., "xx.xxx.18.173")
  - Time range (e.g., "May 10, 9:00 AM – 10:30 AM")

### Styling
- **Colors:** Use theme colors from `colors.ts` (assign one color per role for consistency)
- **Height:** 200px (consistent with other default charts)
- **Container:** White background with light border (matches other charts)

## Deliverable 1: IP History Chart Package

### Repository Structure
New repo: `ip-history-chart` (GitHub)
```
ip-history-chart/
├── package.json
├── src/
│   ├── IpHistoryChart.tsx       # Main component (no Tail History dependencies)
│   ├── useIpHistoryData.ts      # Data fetching hook (configurable: mock or real API)
│   ├── types.ts                 # TypeScript interfaces
│   ├── constants.ts             # Chart config, colors, defaults
│   └── __tests__/
└── docs/
```

### Component API: IpHistoryChart.tsx
**Props:**
```typescript
interface IpHistoryChartProps {
  // Data & State
  data?: IpHistoryEvent[];              // Explicit data (overrides hook)
  dateRange: { start: Date; end: Date }; // Determines chart time window
  isLoading?: boolean;                  // Manual loading state
  error?: string | null;                // Manual error state
  
  // Callbacks (optional, for integration with parent sync)
  onSetExtremes?: (e: Highcharts.AxisSetExtremesEventObject) => void;
  registerChart?: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart?: (id: string) => void;
  
  // Styling
  height?: number;                      // Default: 200px
  theme?: 'light' | 'dark';             // Default: 'light'
  
  // Metadata
  title?: string;                       // Default: "IP History"
  eventMarkers?: ConnectivityEvent[];   // Optional event overlay
}
```

**Behavior:**
- Fully self-contained: works with or without sync callbacks
- When `data` prop provided, uses that; otherwise calls `useIpHistoryData(dateRange)` internally
- States: Loading (skeleton), Error (message), Empty (message), Success (chart)
- **No ChartStrip dependency** — renders its own container with MUI Box/Paper
- **No Tail History theme coupling** — uses imported color constants, not theme context
- **Standalone date range** — respects `dateRange` prop, no dependency on parent date picker

### useIpHistoryData.ts (Data Hook)
```typescript
interface UseIpHistoryDataOptions {
  dateRange: { start: Date; end: Date };
  dataSource?: 'mock' | 'api';    // Default: 'mock'
  apiEndpoint?: string;            // When dataSource='api'
}

function useIpHistoryData(options): {
  series: SeriesData[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}
```

- Generates mock data by default
- Can be swapped to real API by setting `dataSource='api'` + `apiEndpoint`
- Respects selected date range
- Returns Highcharts-ready series format

## Deliverable 2: IP History Review App

### Repository Structure
New repo: `ip-history-review` (GitHub) OR simple Next.js page in existing internal tools repo
```
ip-history-review/
├── package.json
├── pages/
│   └── index.tsx              # Main review page
├── public/
└── .env.example
```

### Review Page Features
- **Standalone date picker** — user can select any date range
- **Mock data toggle** — switch between mock and (if available) real API data
- **State showcases** — demo all states: loading, error, empty, success
- **Responsive layout** — shows chart at mobile/tablet/desktop sizes
- **No authentication required** — internal tool, available to product/dev team
- **Share-friendly** — link can be bookmarked/shared

### Data: Mock or Real?
- Default: mock data (no backend dependency)
- Optional: if real IP history API endpoint exists, add `.env` toggle to switch sources
- Demo page can showcase both mock and real simultaneously (side-by-side)

## Deliverable 3: Tail History Integration

### How Tail History Consumes the Package
1. **Add dependency** — `npm install @ip-history/chart` (or `@viasat/ip-history-chart`)
2. **Create wrapper component** — `src/pages/tailHistory/charts/IpHistory/IpHistory.tsx`
   ```typescript
   import { IpHistoryChart } from '@ip-history/chart';
   import { useTailHistoryDateRange } from '../../hooks/useTailHistoryDateRange';
   
   export const IpHistory: React.FC<ChartWrapperProps> = ({
     registerChart,
     unregisterChart,
     onSetExtremes,
     eventMarkers
   }) => {
     const dateRange = useTailHistoryDateRange();
     
     return (
       <IpHistoryChart
         dateRange={dateRange}
         onSetExtremes={onSetExtremes}
         registerChart={registerChart}
         unregisterChart={unregisterChart}
         eventMarkers={eventMarkers}
         height={200}
       />
     );
   };
   ```
3. **Register in default charts** — add to `ChartRegistry` alongside Usage, Latency, etc.

### Integration Points
- **Date range sync** — Tail History passes `dateRange` prop; chart respects it
- **Zoom sync** — `onSetExtremes` callback flows through; chart responds to other charts' zoom
- **Event markers** — optional event overlay (connectivity events) passed as prop
- **Styling** — chart imports its own colors, no theme context dependency

## Error Handling
- **Loading:** Skeleton placeholder (200px height)
- **Empty:** "No IP history data available" message
- **Error:** "Failed to load IP history" message with error details in console

## Testing Approach
- Package: Unit tests for component, hook, chart config (no Tail History dependency)
- Review App: Manual testing of date range, states, responsiveness
- Tail History: Integration test verifying sync callbacks work
- Mock data covers typical scenarios: multiple IP changes, long/short durations

## Success Criteria

### Package (ip-history-chart)
- [ ] Component renders standalone with `<IpHistoryChart dateRange={...} />`
- [ ] Works with mock data by default, optional API integration
- [ ] Accepts date range prop, respects it
- [ ] Callback props (registerChart, onSetExtremes) are optional
- [ ] Chart renders as xrange Gantt timeline with three roles (Transmit, Receive, TPA)
- [ ] Bars labeled with IP addresses, tooltip shows role/IP/timerange
- [ ] Loading, error, empty states handled gracefully
- [ ] Published to npm/GitHub

### Review App (ip-history-review)
- [ ] Accessible at shareable URL (internal)
- [ ] Date picker allows any range
- [ ] Shows chart in multiple responsive sizes
- [ ] Toggle between mock and real data (if applicable)
- [ ] Easy for product/dev to review and give feedback

### Tail History Integration
- [ ] Wrapper component created in `src/pages/tailHistory/charts/IpHistory/`
- [ ] Registered in default charts grid
- [ ] Synchronized zoom with other charts works
- [ ] Uses package as external dependency (not copy-pasted)
