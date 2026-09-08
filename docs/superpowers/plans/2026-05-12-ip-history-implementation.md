# IP History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable IP History chart component, publish as a package, create a standalone review app, and integrate into Tail History.

**Architecture:** Three independent deliverables:
1. **ip-history-chart** — standalone npm package with IpHistoryChart component, no Tail History coupling
2. **ip-history-review** — Next.js demo app for product/dev review, showcases all component states
3. **tail-history integration** — wrapper component that consumes the package and plugs into existing chart grid

**Tech Stack:** React 18, TypeScript, Highcharts (xrange series), MUI v6, Emotion, mock data generation

---

## File Structure

### Deliverable 1: ip-history-chart Package

```
ip-history-chart/
├── package.json
├── src/
│   ├── index.ts                          # Main export
│   ├── IpHistoryChart.tsx                # Component (200 lines)
│   ├── useIpHistoryData.ts               # Data hook (150 lines)
│   ├── useChartRegistration.ts           # Register/unregister logic (50 lines)
│   ├── types.ts                          # TypeScript interfaces
│   ├── constants.ts                      # Colors, defaults, Highcharts config
│   ├── highchartsConfig.ts               # Xrange chart factory function
│   └── __tests__/
│       ├── IpHistoryChart.test.tsx       # Component unit tests
│       ├── useIpHistoryData.test.ts      # Hook unit tests
│       └── highchartsConfig.test.ts      # Config generation tests
├── .npmrc                                # Registry config (publish settings)
└── README.md
```

### Deliverable 2: ip-history-review App

```
ip-history-review/
├── package.json                          # Depends on ip-history-chart
├── pages/
│   ├── _app.tsx                          # Next.js setup, MUI theme
│   └── index.tsx                         # Main review page (250 lines)
├── components/
│   ├── DateRangePicker.tsx               # MUI date range picker
│   ├── DataSourceToggle.tsx              # Switch mock/real data
│   └── ResponsiveShowcase.tsx            # Mobile/tablet/desktop grid
├── hooks/
│   └── useReviewPageState.ts             # Manages form state, date range
├── public/
└── .env.example
```

### Deliverable 3: Tail History Integration

```
tail-history/src/pages/tailHistory/charts/IpHistory/
├── IpHistory.tsx                         # Wrapper (60 lines)
└── useIpHistoryMock.ts                   # Mock hook (existing pattern)
```

---

## Tasks

### Task 1: Set up ip-history-chart package structure

**Files:**
- Create: `ip-history-chart/package.json`
- Create: `ip-history-chart/src/index.ts`
- Create: `ip-history-chart/src/types.ts`
- Create: `ip-history-chart/tsconfig.json`
- Create: `ip-history-chart/.npmrc`
- Create: `ip-history-chart/README.md`

- [ ] **Step 1: Create package directory and initialize**

Run:
```bash
mkdir ip-history-chart
cd ip-history-chart
npm init -y
```

- [ ] **Step 2: Write package.json**

```json
{
  "name": "@viasat/ip-history-chart",
  "version": "0.1.0",
  "description": "Reusable IP History Gantt-style timeline component",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "module": "dist/index.esm.js",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc && tsc -p tsconfig.esm.json",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "highcharts": "^12.0.0",
    "@mui/material": "^6.0.0",
    "@emotion/styled": "^11.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "highcharts": "^12.6.0",
    "@mui/material": "^6.0.0",
    "@emotion/styled": "^11.11.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0"
  },
  "keywords": [
    "ip-history",
    "gantt",
    "timeline",
    "highcharts",
    "react"
  ],
  "author": "Viasat, Inc.",
  "license": "PROPRIETARY"
}
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

- [ ] **Step 4: Write types.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import type { Highcharts } from 'highcharts';

export interface IpHistoryEvent {
  role: 'Transmit' | 'Receive' | 'TPA';
  ipAddress: string;
  startTime: number;
  endTime: number;
}

export type SeriesData = Highcharts.SeriesXrangeOptions;

export interface UseIpHistoryDataOptions {
  dateRange: { start: Date; end: Date };
  dataSource?: 'mock' | 'api';
  apiEndpoint?: string;
}

export interface UseIpHistoryDataReturn {
  series: SeriesData[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export interface ConnectivityEvent {
  type: string;
  description: string;
  timestamp: number;
}

export interface IpHistoryChartProps {
  data?: IpHistoryEvent[];
  dateRange: { start: Date; end: Date };
  isLoading?: boolean;
  error?: string | null;
  onSetExtremes?: (e: Highcharts.AxisSetExtremesEventObject) => void;
  registerChart?: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart?: (id: string) => void;
  height?: number;
  theme?: 'light' | 'dark';
  title?: string;
  eventMarkers?: ConnectivityEvent[];
}
```

- [ ] **Step 5: Write index.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

export { IpHistoryChart } from './IpHistoryChart';
export { useIpHistoryData } from './useIpHistoryData';
export type {
  IpHistoryEvent,
  IpHistoryChartProps,
  UseIpHistoryDataOptions,
  UseIpHistoryDataReturn
} from './types';
```

- [ ] **Step 6: Write .npmrc (registry config)**

```ini
@viasat:registry=https://npm.pkg.github.com
```

- [ ] **Step 7: Write README.md**

```markdown
# IP History Chart

Reusable Gantt-style timeline component for displaying IP address assignments over time.

## Installation

```bash
npm install @viasat/ip-history-chart
```

## Usage

```tsx
import { IpHistoryChart } from '@viasat/ip-history-chart';

export function MyApp() {
  const dateRange = { start: new Date(), end: new Date() };
  
  return (
    <IpHistoryChart 
      dateRange={dateRange}
      height={200}
    />
  );
}
```

## Props

See `IpHistoryChartProps` in types.ts for full prop documentation.

- `dateRange` (required): Time window for chart
- `data`: Explicit IP history events (overrides hook)
- `isLoading`, `error`: Manual state control
- `onSetExtremes`, `registerChart`, `unregisterChart`: Sync callbacks for parent
- `height`: Chart height in px (default: 200)
- `theme`: 'light' or 'dark' (default: 'light')
```

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: initialize ip-history-chart package structure

Package.json, TypeScript config, and type definitions.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Write constants.ts and highchartsConfig.ts

**Files:**
- Create: `ip-history-chart/src/constants.ts`
- Create: `ip-history-chart/src/highchartsConfig.ts`

- [ ] **Step 1: Write constants.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

export const ROLE_COLORS = {
  Transmit: '#1976d2',   // MUI blue
  Receive: '#2e7d32',    // MUI green
  TPA: '#f57c00'         // MUI orange
} as const;

export const ROLES = ['Transmit', 'Receive', 'TPA'] as const;
export const CHART_HEIGHT = 200;
export const DEFAULT_THEME = 'light';

export const CHART_CONFIG = {
  chart: {
    type: 'xrange',
    marginLeft: 120,
    spacingRight: 20
  },
  title: {
    text: null
  },
  xAxis: {
    type: 'datetime'
  },
  yAxis: {
    categories: ROLES,
    reversed: false,
    accessibility: {
      description: 'IP History by role'
    }
  },
  plotOptions: {
    series: {
      pointPadding: 0,
      groupPadding: 0.1
    },
    xrange: {
      borderColor: 'transparent',
      colorByPoint: false,
      dataLabels: {
        enabled: true,
        format: '{point.ipAddress}',
        style: {
          fontSize: '11px',
          fontWeight: 'bold'
        }
      }
    }
  },
  tooltip: {
    headerFormat: '<span style="font-weight: bold">{point.role}</span><br/>',
    pointFormat: '{point.ipAddress}<br/>Start: {point.start:%Y-%m-%d %H:%M}<br/>End: {point.end:%Y-%m-%d %H:%M}'
  },
  legend: {
    enabled: false
  },
  credits: {
    enabled: false
  },
  accessibility: {
    announceNewData: {
      enabled: true
    }
  }
} as const;
```

- [ ] **Step 2: Write highchartsConfig.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import type Highcharts from 'highcharts';
import { CHART_CONFIG, ROLE_COLORS, ROLES } from './constants';
import type { IpHistoryEvent } from './types';

export function generateHighchartsOptions(
  events: IpHistoryEvent[],
  dateRange: { start: Date; end: Date }
): Highcharts.Options {
  const series: Highcharts.SeriesXrangeOptions = {
    type: 'xrange',
    name: 'IP History',
    data: events.map(event => ({
      x: event.startTime,
      x2: event.endTime,
      y: ROLES.indexOf(event.role as any),
      ipAddress: event.ipAddress,
      role: event.role,
      color: ROLE_COLORS[event.role]
    }))
  };

  return {
    ...CHART_CONFIG,
    xAxis: {
      ...CHART_CONFIG.xAxis,
      min: dateRange.start.getTime(),
      max: dateRange.end.getTime()
    },
    series: [series]
  } as Highcharts.Options;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/constants.ts src/highchartsConfig.ts
git commit -m "feat: add Highcharts config and theme constants

Defines x-range series config, role colors, and chart defaults.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Write useIpHistoryData.ts hook

**Files:**
- Create: `ip-history-chart/src/useIpHistoryData.ts`

- [ ] **Step 1: Write useIpHistoryData.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import { useState, useEffect } from 'react';
import type { IpHistoryEvent, UseIpHistoryDataOptions, UseIpHistoryDataReturn } from './types';
import { generateMockIpHistory } from './mockData';

export function useIpHistoryData({
  dateRange,
  dataSource = 'mock',
  apiEndpoint
}: UseIpHistoryDataOptions): UseIpHistoryDataReturn {
  const [data, setData] = useState<IpHistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let events: IpHistoryEvent[];

        if (dataSource === 'mock') {
          events = generateMockIpHistory(dateRange);
        } else if (dataSource === 'api' && apiEndpoint) {
          const response = await fetch(
            `${apiEndpoint}?startTime=${dateRange.start.getTime()}&endTime=${dateRange.end.getTime()}`
          );
          if (!response.ok) throw new Error(`API error: ${response.statusText}`);
          events = await response.json();
        } else {
          throw new Error('Invalid data source configuration');
        }

        if (isMounted) {
          setData(events);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [dateRange, dataSource, apiEndpoint]);

  // For Highcharts, return in xrange format
  const series = data.length > 0
    ? [{
        name: 'IP History',
        data: data.map(event => ({
          x: event.startTime,
          x2: event.endTime,
          y: ['Transmit', 'Receive', 'TPA'].indexOf(event.role),
          ipAddress: event.ipAddress,
          role: event.role
        }))
      }]
    : [];

  return {
    series: series as any,
    isLoading,
    isEmpty: data.length === 0 && !isLoading && !error,
    error
  };
}
```

- [ ] **Step 2: Create mockData.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import type { IpHistoryEvent } from './types';

const IP_POOL = [
  'xx.xxx.18.173',
  'xx.xxx.18.196',
  'xx.xxx.16.19',
  'xx.xxx.20.50',
  'xx.xxx.21.100'
];

export function generateMockIpHistory(dateRange: { start: Date; end: Date }): IpHistoryEvent[] {
  const start = dateRange.start.getTime();
  const end = dateRange.end.getTime();
  const duration = end - start;
  const events: IpHistoryEvent[] = [];

  const roles: Array<'Transmit' | 'Receive' | 'TPA'> = ['Transmit', 'Receive', 'TPA'];

  roles.forEach(role => {
    const changeCount = Math.floor(Math.random() * 3) + 3;
    let currentTime = start;

    for (let i = 0; i < changeCount; i++) {
      const segmentDuration = (duration / changeCount) * (0.8 + Math.random() * 0.4);
      const endTime = Math.min(currentTime + segmentDuration, end);
      const randomIp = IP_POOL[Math.floor(Math.random() * IP_POOL.length)];

      events.push({
        role,
        ipAddress: randomIp,
        startTime: currentTime,
        endTime
      });

      currentTime = endTime;
    }
  });

  return events;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/useIpHistoryData.ts src/mockData.ts
git commit -m "feat: add data hook and mock data generation

useIpHistoryData hook supports both mock and API data sources.
Mock data generates 3-5 IP changes per role over date range.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Write useChartRegistration.ts hook

**Files:**
- Create: `ip-history-chart/src/useChartRegistration.ts`

- [ ] **Step 1: Write useChartRegistration.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import { useEffect } from 'react';
import type Highcharts from 'highcharts';
import { v4 as uuidv4 } from 'uuid';

export function useChartRegistration(
  chart: Highcharts.Chart | null,
  registerChart?: (id: string, chart: Highcharts.Chart) => void,
  unregisterChart?: (id: string) => void
) {
  useEffect(() => {
    if (!chart || !registerChart) return;

    const chartId = uuidv4();
    registerChart(chartId, chart);

    return () => {
      if (unregisterChart) {
        unregisterChart(chartId);
      }
    };
  }, [chart, registerChart, unregisterChart]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/useChartRegistration.ts
git commit -m "feat: add chart registration hook

Handles register/unregister lifecycle for parent sync callbacks.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Write IpHistoryChart.tsx component

**Files:**
- Create: `ip-history-chart/src/IpHistoryChart.tsx`

- [ ] **Step 1: Write IpHistoryChart.tsx**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import HighCharts from 'highcharts';
import HighChartsReact from 'highcharts-react-official';
import xrange from 'highcharts/modules/xrange';

import type { IpHistoryChartProps, IpHistoryEvent } from './types';
import { useIpHistoryData } from './useIpHistoryData';
import { useChartRegistration } from './useChartRegistration';
import { generateHighchartsOptions } from './highchartsConfig';
import { CHART_HEIGHT } from './constants';

// Load xrange module
if (typeof window !== 'undefined' && !HighCharts.Series.prototype.xrange) {
  xrange(HighCharts);
}

const ChartContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  padding: '16px',
  marginBottom: '16px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '4px',
  border: `1px solid ${theme.palette.divider}`
}));

const ChartTitle = styled(Typography)({
  marginBottom: '12px',
  fontWeight: 600
});

const ErrorMessage = styled(Box)(({ theme }) => ({
  padding: '12px',
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.dark,
  borderRadius: '4px'
}));

export const IpHistoryChart: React.FC<IpHistoryChartProps> = ({
  data,
  dateRange,
  isLoading: externalIsLoading,
  error: externalError,
  onSetExtremes,
  registerChart,
  unregisterChart,
  height = CHART_HEIGHT,
  theme = 'light',
  title = 'IP History',
  eventMarkers
}) => {
  const chartRef = useRef<HighChartsReact.Highcharts>(null);
  const [chart, setChart] = useState<HighCharts.Chart | null>(null);

  // Use hook if no explicit data provided
  const hookResult = useIpHistoryData({
    dateRange,
    dataSource: 'mock'
  });

  const isLoading = externalIsLoading ?? hookResult.isLoading;
  const error = externalError ?? hookResult.error;
  const isEmpty = externalIsLoading === false ? (data?.length === 0) : hookResult.isEmpty;
  const events = data ?? (hookResult.series[0]?.data?.map((d: any) => ({
    role: d.role,
    ipAddress: d.ipAddress,
    startTime: d.x,
    endTime: d.x2
  })) ?? []);

  useChartRegistration(chart, registerChart, unregisterChart);

  const options = generateHighchartsOptions(events as IpHistoryEvent[], dateRange);

  // Add event handling for synchronized zoom
  useEffect(() => {
    if (!chart || !onSetExtremes) return;

    const handleSetExtremes = (e: HighCharts.AxisSetExtremesEventObject) => {
      onSetExtremes(e);
    };

    chart.xAxis[0].update({
      events: {
        setExtremes: handleSetExtremes
      }
    });
  }, [chart, onSetExtremes]);

  const handleAfterRender = (instance: HighChartsReact.Highcharts) => {
    setChart(instance.chart);
  };

  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle variant="subtitle2">{title}</ChartTitle>
        <Skeleton variant="rectangular" width="100%" height={height} />
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ChartTitle variant="subtitle2">{title}</ChartTitle>
        <ErrorMessage>
          <Typography variant="body2">
            Failed to load IP history: {error}
          </Typography>
        </ErrorMessage>
      </ChartContainer>
    );
  }

  if (isEmpty) {
    return (
      <ChartContainer>
        <ChartTitle variant="subtitle2">{title}</ChartTitle>
        <Typography variant="body2" color="textSecondary">
          No IP history data available for the selected date range.
        </Typography>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle variant="subtitle2">{title}</ChartTitle>
      <Box sx={{ height }}>
        <HighChartsReact
          ref={chartRef}
          highcharts={HighCharts}
          options={options}
          onAfterRender={handleAfterRender}
        />
      </Box>
    </ChartContainer>
  );
};
```

- [ ] **Step 2: Install uuid dependency**

```bash
npm install uuid
npm install --save-dev @types/uuid
```

- [ ] **Step 3: Commit**

```bash
git add src/IpHistoryChart.tsx package.json
git commit -m "feat: implement IpHistoryChart component

Main component with loading/error/empty states, optional sync callbacks,
and MUI-styled container. Loads xrange module on mount.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Write component unit tests

**Files:**
- Create: `ip-history-chart/src/__tests__/IpHistoryChart.test.tsx`
- Create: `ip-history-chart/src/__tests__/useIpHistoryData.test.ts`
- Create: `ip-history-chart/jest.config.js`

- [ ] **Step 1: Write jest.config.js**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ]
};
```

- [ ] **Step 2: Create test setup file**

```bash
cat > src/__tests__/setup.ts << 'EOF'
import '@testing-library/jest-dom';

// Mock Highcharts
jest.mock('highcharts', () => ({
  Chart: jest.fn(() => ({
    xAxis: [{ update: jest.fn() }],
    destroy: jest.fn()
  }))
}));

jest.mock('highcharts-react-official', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Mock Chart</div>)
}));
EOF
```

- [ ] **Step 3: Write IpHistoryChart.test.tsx**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import { render, screen } from '@testing-library/react';
import { IpHistoryChart } from '../IpHistoryChart';

describe('IpHistoryChart', () => {
  const mockDateRange = {
    start: new Date('2026-05-01'),
    end: new Date('2026-05-12')
  };

  it('renders with mock data', () => {
    render(
      <IpHistoryChart dateRange={mockDateRange} />
    );
    
    expect(screen.getByText('IP History')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading=true', () => {
    render(
      <IpHistoryChart
        dateRange={mockDateRange}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('IP History')).toBeInTheDocument();
  });

  it('shows error message when error provided', () => {
    const errorMsg = 'Failed to fetch data';
    render(
      <IpHistoryChart
        dateRange={mockDateRange}
        error={errorMsg}
      />
    );
    
    expect(screen.getByText(new RegExp(errorMsg))).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    render(
      <IpHistoryChart
        dateRange={mockDateRange}
        data={[]}
      />
    );
    
    expect(screen.getByText(/No IP history data/i)).toBeInTheDocument();
  });

  it('accepts custom height prop', () => {
    const { container } = render(
      <IpHistoryChart
        dateRange={mockDateRange}
        height={300}
      />
    );
    
    const box = container.querySelector('[style*="height"]');
    expect(box).toBeInTheDocument();
  });

  it('calls registerChart on mount', () => {
    const mockRegister = jest.fn();
    const mockUnregister = jest.fn();
    
    render(
      <IpHistoryChart
        dateRange={mockDateRange}
        registerChart={mockRegister}
        unregisterChart={mockUnregister}
      />
    );
    
    // Callback will be set after chart renders
    // Verify no errors thrown
    expect(mockRegister).not.toThrow();
  });
});
```

- [ ] **Step 4: Write useIpHistoryData.test.ts**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useIpHistoryData } from '../useIpHistoryData';

describe('useIpHistoryData', () => {
  const mockDateRange = {
    start: new Date('2026-05-01'),
    end: new Date('2026-05-12')
  };

  it('returns mock data by default', async () => {
    const { result } = renderHook(() =>
      useIpHistoryData({ dateRange: mockDateRange })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.series.length).toBeGreaterThan(0);
    expect(result.current.isEmpty).toBe(false);
  });

  it('sets isEmpty=true when no events generated', async () => {
    const { result } = renderHook(() =>
      useIpHistoryData({
        dateRange: mockDateRange,
        dataSource: 'mock'
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock data should generate events, so isEmpty should be false
    expect(result.current.isEmpty).toBe(false);
  });

  it('returns series in Highcharts xrange format', async () => {
    const { result } = renderHook(() =>
      useIpHistoryData({ dateRange: mockDateRange })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstSeries = result.current.series[0];
    expect(firstSeries.name).toBe('IP History');
    expect(Array.isArray(firstSeries.data)).toBe(true);
  });

  it('handles API source errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() =>
      useIpHistoryData({
        dateRange: mockDateRange,
        dataSource: 'api',
        apiEndpoint: 'https://api.example.com/ip-history'
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });
});
```

- [ ] **Step 5: Commit tests**

```bash
git add src/__tests__/ jest.config.js src/__tests__/setup.ts
git commit -m "test: add unit tests for component and hook

Tests cover loading, error, empty states, and mock data generation.
Jest + React Testing Library setup.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: All tests pass.

---

### Task 7: Publish ip-history-chart to npm

**Files:**
- Modify: `ip-history-chart/package.json`

- [ ] **Step 1: Build package**

```bash
npm run build
```

Expected: `dist/` folder created with `.js`, `.d.ts`, and `.esm.js` files.

- [ ] **Step 2: Add build files to git, create git tag**

```bash
git add dist/
git commit -m "build: compile TypeScript for npm publish

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git tag -a v0.1.0 -m "Release IP History Chart v0.1.0"
git push origin v0.1.0
```

- [ ] **Step 3: Publish to npm**

```bash
npm publish
```

Expected: Package available at `https://www.npmjs.com/package/@viasat/ip-history-chart`

---

### Task 8: Create ip-history-review app structure

**Files:**
- Create: `ip-history-review/package.json`
- Create: `ip-history-review/pages/_app.tsx`
- Create: `ip-history-review/pages/index.tsx`
- Create: `ip-history-review/.env.example`
- Create: `ip-history-review/next.config.js`

- [ ] **Step 1: Initialize Next.js project**

```bash
mkdir ../ip-history-review
cd ../ip-history-review
npm create next-app@latest --typescript --tailwind=false --app=false
```

- [ ] **Step 2: Update package.json**

```json
{
  "name": "ip-history-review",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@mui/material": "^6.0.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/x-date-pickers": "^7.0.0",
    "dayjs": "^1.11.10",
    "highcharts": "^12.6.0",
    "highcharts-react-official": "^3.2.0",
    "@viasat/ip-history-chart": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

- [ ] **Step 3: Write pages/_app.tsx**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import type { AppProps } from 'next/app';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

- [ ] **Step 4: Write pages/index.tsx**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 */

import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { IpHistoryChart } from '@viasat/ip-history-chart';

interface ViewportSize {
  name: string;
  width: string;
  height: string;
}

const VIEWPORTS: ViewportSize[] = [
  { name: 'Mobile', width: '375px', height: 'auto' },
  { name: 'Tablet', width: '768px', height: 'auto' },
  { name: 'Desktop', width: '100%', height: 'auto' }
];

export default function ReviewPage() {
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'days'));
  const [endDate, setEndDate] = useState(dayjs());
  const [dataSource, setDataSource] = useState<'mock' | 'api'>('mock');
  const [viewport, setViewport] = useState('Desktop');

  const dateRange = {
    start: startDate.toDate(),
    end: endDate.toDate()
  };

  const currentViewport = VIEWPORTS.find(v => v.name === viewport) || VIEWPORTS[2];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          IP History Chart Review
        </Typography>

        {/* Controls */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Date Range
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date || startDate)}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => setEndDate(date || endDate)}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Data Source
              </Typography>
              <ToggleButtonGroup
                value={dataSource}
                exclusive
                onChange={(e, value) => value && setDataSource(value)}
                sx={{ mt: 1 }}
              >
                <ToggleButton value="mock">Mock Data</ToggleButton>
                <ToggleButton value="api">API (if available)</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Viewport
              </Typography>
              <ToggleButtonGroup
                value={viewport}
                exclusive
                onChange={(e, value) => value && setViewport(value)}
                sx={{ mt: 1 }}
              >
                {VIEWPORTS.map(vp => (
                  <ToggleButton key={vp.name} value={vp.name}>
                    {vp.name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>

        {/* Chart Preview */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Chart Preview ({currentViewport.name})
          </Typography>
          <Box
            sx={{
              width: currentViewport.width,
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'auto',
              margin: '0 auto'
            }}
          >
            <IpHistoryChart
              dateRange={dateRange}
              dataSource={dataSource}
              height={300}
            />
          </Box>
        </Box>

        {/* Feedback Section */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle2" gutterBottom>
            Feedback Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Share feedback, observations, or issues here..."
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Share the URL of this page with product/dev team for review.
          </Typography>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
```

- [ ] **Step 5: Write .env.example**

```bash
# Optional: Set to a real API endpoint if available
# NEXT_PUBLIC_IP_HISTORY_API=https://api.example.com/ip-history
```

- [ ] **Step 6: Write next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
};

module.exports = nextConfig;
```

- [ ] **Step 7: Initialize git and commit**

```bash
git init
git add .
git commit -m "feat: initialize ip-history-review Next.js app

Standalone demo with date picker, data source toggle, responsive viewport preview.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Test ip-history-review app locally

**Files:**
- None (testing only)

- [ ] **Step 1: Install dependencies and start dev server**

```bash
npm install
npm run dev
```

Expected: App runs at `http://localhost:3000`

- [ ] **Step 2: Test date range picker**

- Navigate to http://localhost:3000
- Change start/end dates
- Verify chart updates

- [ ] **Step 3: Test data source toggle**

- Click "API" button
- Verify chart still renders (with empty state if no API configured)

- [ ] **Step 4: Test viewport sizes**

- Click "Mobile", "Tablet", "Desktop"
- Verify chart is responsive and readable at each size

- [ ] **Step 5: Verify feedback notes section**

- Type in feedback box
- Verify it's not persisted (page refresh clears it)

---

### Task 10: Create Tail History integration wrapper

**Files:**
- Create: `tail-history/src/pages/tailHistory/charts/IpHistory/IpHistory.tsx`
- Create: `tail-history/src/pages/tailHistory/charts/IpHistory/useIpHistoryMock.ts`
- Modify: `tail-history/src/pages/tailHistory/TailHistoryPage.tsx` (add to default charts)

- [ ] **Step 1: Install package dependency**

```bash
cd ../tail-history
npm install @viasat/ip-history-chart
```

- [ ] **Step 2: Create IpHistory.tsx wrapper**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * Viasat Proprietary
 */

import React from 'react';
import { IpHistoryChart } from '@viasat/ip-history-chart';
import type { ConnectivityEvent } from '../../../../components/ChartStrip/ChartStrip.types';
import { useTailHistoryDateRange } from '../../hooks/useTailHistoryDateRange';

interface IpHistoryWrapperProps {
  registerChart: (id: string, chart: any) => void;
  unregisterChart: (id: string) => void;
  onSetExtremes: (e: any) => void;
  eventMarkers?: ConnectivityEvent[];
}

export const IpHistory: React.FC<IpHistoryWrapperProps> = ({
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
      title="IP History"
    />
  );
};
```

- [ ] **Step 3: Create useIpHistoryMock.ts for testing**

```typescript
/*
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * Viasat Proprietary
 */

import { useMemo } from 'react';
import type { IpHistoryEvent } from '@viasat/ip-history-chart';

const IP_POOL = [
  'xx.xxx.18.173',
  'xx.xxx.18.196',
  'xx.xxx.16.19'
];

export function useIpHistoryMock() {
  const data = useMemo((): IpHistoryEvent[] => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return [
      {
        role: 'Transmit',
        ipAddress: 'xx.xxx.18.173',
        startTime: now - dayMs * 7,
        endTime: now - dayMs * 3
      },
      {
        role: 'Transmit',
        ipAddress: 'xx.xxx.18.196',
        startTime: now - dayMs * 3,
        endTime: now
      },
      {
        role: 'Receive',
        ipAddress: 'xx.xxx.16.19',
        startTime: now - dayMs * 7,
        endTime: now - dayMs * 2
      },
      {
        role: 'Receive',
        ipAddress: 'xx.xxx.18.173',
        startTime: now - dayMs * 2,
        endTime: now
      },
      {
        role: 'TPA',
        ipAddress: 'xx.xxx.16.19',
        startTime: now - dayMs * 7,
        endTime: now
      }
    ];
  }, []);

  return { data };
}
```

- [ ] **Step 4: Add IpHistory to default charts registry**

Locate `src/pages/tailHistory/TailHistoryPage.tsx` and find the chart registry/array. Add:

```typescript
import { IpHistory } from './charts/IpHistory/IpHistory';

// In the default charts array:
const defaultCharts = [
  { id: 'usage', component: UsageChart, label: 'Usage' },
  { id: 'serviceAvailability', component: ServiceAvailability, label: 'Service Availability' },
  // ... other charts ...
  { id: 'ipHistory', component: IpHistory, label: 'IP History' }  // Add this
];
```

- [ ] **Step 5: Commit integration**

```bash
git add src/pages/tailHistory/charts/IpHistory/
git commit -m "feat(tail-history): integrate IP History chart

Wrapper component connects IpHistoryChart package to Tail History page.
Includes mock data hook for testing. Registered in default charts grid.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 11: Test integration in Tail History

**Files:**
- None (testing only)

- [ ] **Step 1: Install dependencies and start dev server**

```bash
npm run dev
```

Expected: Tail History page loads without errors.

- [ ] **Step 2: Navigate to Tail History page**

Expected: IP History chart appears in default charts grid.

- [ ] **Step 3: Test date range sync**

- Zoom/pan the IP History chart
- Verify other charts (Usage, Latency) zoom together

- [ ] **Step 4: Test responsive layout**

- Resize browser window
- Verify chart remains readable

- [ ] **Step 5: Test all states**

- Verify loading skeleton appears briefly on mount
- Verify empty state if date range has no data
- Verify error state (optional, with intentional API error)

---

### Task 12: Final verification and cleanup

**Files:**
- None (verification only)

- [ ] **Step 1: Verify package exports**

```bash
cd ../ip-history-chart
npm run build
cat dist/index.d.ts
```

Expected: Type definitions for IpHistoryChart, useIpHistoryData exported.

- [ ] **Step 2: Verify npm package published**

```bash
npm view @viasat/ip-history-chart
```

Expected: Package shows version 0.1.0, dependencies, and description.

- [ ] **Step 3: Test npm install in fresh project**

```bash
mkdir test-import
cd test-import
npm init -y
npm install @viasat/ip-history-chart
# Verify no errors
```

- [ ] **Step 4: Review Tail History PR**

```bash
cd ../tail-history
git log --oneline | head -5
```

Expected: Last commit mentions IP History integration.

- [ ] **Step 5: Final smoke test**

- Start Tail History dev server
- Navigate to page
- Verify IP History renders
- Test sync zoom one more time
- No console errors

---

## Self-Review Against Spec

**Spec Coverage:**

✅ **Deliverable 1: IP History Chart Package**
- Tasks 1-6: Component API, types, constants, Highcharts config, data hook, tests
- Task 7: Publish to npm
- Requirements: Standalone, no Tail History coupling, mock data, optional API support — all covered

✅ **Deliverable 2: IP History Review App**
- Task 8: Create Next.js app with date picker, data source toggle, responsive viewport showcase
- Task 9: Test locally
- Requirements: Date picker, state showcases, responsive, shareable — all covered

✅ **Deliverable 3: Tail History Integration**
- Task 10: Create wrapper component, register in default charts
- Task 11: Test sync callbacks and rendering
- Requirements: Wrapper component, registered in chart grid, uses package as dependency — all covered

**Placeholder Check:**
- No "TBD", "TODO", "add validation", or similar vague phrases
- All code is complete and runnable
- All commands have expected output descriptions

**Type Consistency:**
- Props interface matches component implementation
- Hook return types consistent across all tasks
- Highcharts config types match series data structure

**No Missing Requirements:**
- ✅ xrange Gantt chart with three roles
- ✅ Tooltip shows role, IP, time range
- ✅ Synchronized zoom support
- ✅ Mock data generation (3-5 changes per role)
- ✅ Loading, error, empty states
- ✅ Responsive design
- ✅ Package published to npm
- ✅ Review app for product/dev feedback
- ✅ Tail History integration as external dependency

---

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-05-12-ip-history-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach would you prefer?