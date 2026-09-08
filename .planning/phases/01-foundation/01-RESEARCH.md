/***
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * The information in this software is subject to change without notice and
 * should not be construed as a commitment by Viasat, Inc.
 *
 * Viasat Proprietary
 * The Proprietary Information provided herein is proprietary to Viasat and
 * must be protected from further distribution and use. Disclosure to others,
 * use or copying without express written authorization of Viasat, Inc. is strictly
 * prohibited.
 *
 * Description: Phase 1 Foundation — Research
 */

# Phase 1: Foundation — Research

**Researched:** 2026-05-04
**Domain:** React + TypeScript standalone app scaffold, Zustand view store, Highcharts global defaults, MUI v6 date picker, chart instance registry
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The primary purpose of this entire project is enabling users to pick from 80+ metrics and build custom connectivity charts. All infrastructure decisions should optimize for this workflow.
- **D-02:** Phase 1 is pure infrastructure — no user-visible chart features ship yet. Success means a running app shell with correct plumbing.
- **D-03:** New standalone React + TypeScript + MUI v6 project in a new directory (not inside insights-manager). Follow insights-manager patterns for code structure, state, and styling.
- **D-04:** HighCharts global defaults MUST be set before any chart renders: `Highcharts.setOptions({ time: { useUTC: true }, plotOptions: { series: { turboThreshold: 0 } } })`. These cannot be safely retrofitted after charts exist.
- **D-05:** Single HighCharts import bundle — use `highcharts/highstock` as the base everywhere. Never mix `highcharts` and `highcharts/highstock` imports in the same project (breaks TypeScript declarations).
- **D-06:** Zustand store slices: `timeRange` (full selected range), `zoomedRange` (current zoom window), `playhead` (current playback timestamp), `playback` (isPlaying, speed). Use `createViewStore()` pattern from insights-manager.
- **D-07:** Chart instance registry held in `useRef<Map<string, Highcharts.Chart>>` at the TailHistory page level — never in Zustand, never in React state. Charts register/deregister via callbacks passed down as props.
- **D-08:** Date range picker defaults to last 14 days. Changing the range invalidates all React Query caches and triggers refetch.
- **D-09:** Every source file must include the Viasat copyright header (© 2026 Viasat, Inc.).

### Claude's Discretion

- Project scaffolding tool (Vite vs CRA) — Claude decides based on ecosystem fit
- Folder structure within `src/` — follow insights-manager conventions
- Date range picker component choice — use @viasat/insights-components if it provides one, otherwise MUI DatePicker
- TypeScript strict mode settings — standard Insights platform settings

### Deferred Ideas (OUT OF SCOPE)

- Date range presets (7d, 30d, 90d quickpicks) — user didn't express a preference; Claude decides
- Page header layout (tail number display, airline info) — not discussed; Claude implements something reasonable matching Figma
- Tail ID routing strategy (URL param vs query string) — not discussed; Claude decides based on platform conventions

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Project scaffolded as React + TypeScript + MUI v6 following Insights patterns (Zustand, React Query, Emotion) | Vite scaffold pattern documented; package versions verified; folder structure from insights-manager confirmed |
| FOUND-02 | HighCharts global defaults configured (useUTC: true, turboThreshold: 0, single import bundle via highcharts/highstock) | `Highcharts.setOptions()` call pattern documented with exact code; bundle selection rule confirmed from existing research |
| FOUND-03 | Shared time range Zustand store defined with `timeRange` and `zoomedRange` slices | `createViewStore()` factory read from source; full store shape with all required slices documented |
| FOUND-04 | Date range picker with default 14-day lookback; user can change range and charts reload | `@viasat/insights-components` `DatePicker` component confirmed and its API documented; React Query invalidation pattern confirmed |
| FOUND-05 | Chart instance registry as `useRef<Map<string, Highcharts.Chart>>` at page level | Registry pattern documented from ARCHITECTURE.md research; `registerChart` / `unregisterChart` callback pattern specified |

</phase_requirements>

---

## Summary

Phase 1 creates the complete project scaffold for the Tail History View — a standalone React + TypeScript + MUI v6 application that lives in a new directory separate from insights-manager but mirrors its structural patterns exactly. The phase has no user-visible chart features; its purpose is correct infrastructure plumbing that all subsequent phases depend on.

Three categories of work must be done in the right order to avoid retrofitting pain: (1) project scaffold and Highcharts global defaults must happen first and simultaneously — Highcharts defaults must be registered in `main.tsx` before any `<Chart>` component can render; (2) the Zustand view store must declare all five slices (`timeRange`, `zoomedRange`, `playhead`, `playback`, `customCharts`) in their final shape even though Phase 1 only uses `timeRange` — changing the store shape later cascades into every consuming component; (3) the chart instance registry must be wired at the `TailHistoryPage` level with stable callback props so Phase 2 can drop chart strips in without architectural changes.

The `@viasat/insights-components` package exports a `DatePicker` component with start/end date range state that satisfies FOUND-04 without pulling in `@mui/x-date-pickers-pro`. This is the preferred choice for platform consistency. The key version alignment decision: insights-manager uses TanStack React Query v4, but CLAUDE.md recommends v5 for this new project — the `useFetch` pattern must be adapted for v5 API (specifically: `cacheTime` renamed to `gcTime`).

**Primary recommendation:** Scaffold with Vite (not CRA). CRA is not actively maintained (5.1.0 released 2023, no React 18 native support). Vite 8.x with `@vitejs/plugin-react` delivers faster builds and HMR, works cleanly with MUI v6 + Emotion, and is the correct choice for a new 2026 React 18 project.

---

## Project Constraints (from CLAUDE.md)

These directives are mandatory and override any pattern that contradicts them.

| Directive | What It Means for Phase 1 |
|-----------|--------------------------|
| Every source file must include Viasat copyright header (© 2026 Viasat, Inc.) | All 7+ files created in Phase 1 require the full copyright block at line 1 |
| React + TypeScript + MUI v6 + HighCharts — must remain consistent with Insights ecosystem | No alternative frameworks; pin MUI to v6.x explicitly in package.json |
| `@viasat/insights-components` for shared UI | Use its `DatePicker` component; do NOT rebuild a date picker |
| Zustand for global state via `createViewStore()` — no Redux, no React Context | View store factory must be an exact replica of insights-manager's factory |
| TanStack React Query via `useFetch` hook pattern — no raw `fetch`, no axios | `useFetch` must be adapted for React Query v5 (`gcTime` not `cacheTime`) |
| Emotion `styled()` or MUI `styled()` — no CSS modules, no hardcoded hex colors | All Phase 1 styled components use Emotion; colors import from `colors.ts` |
| Prettier: single quotes, no trailing commas, 120 print width, 2-space indent, semicolons required | Configure `.prettierrc` in the new project root to these exact settings |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI rendering | Platform constraint; newer than insights-manager's React 17 — confirmed compatible with MUI v6 and @highcharts/react |
| TypeScript | 5.x | Type safety | Platform constraint; insights-manager uses 4.6.4 but v5 is current and backward-compatible |
| Vite | 8.0.10 (latest) | Build tool + dev server | CRA is unmaintained (2023); Vite provides faster HMR, native ESM, works cleanly with Emotion/MUI v6 |
| `@vitejs/plugin-react` | 6.0.1 (latest) | React JSX transform for Vite | Official React plugin; handles emotion's `@emotion/babel-plugin` automatically |

### Highcharts
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `highcharts` | 12.6.0 (latest verified) | Chart engine — use `highcharts/highstock` import everywhere | Ecosystem constraint; v12 is current (Nov 2024); DataTable-based internals |
| `@highcharts/react` | 4.2.1 (latest verified) | Official React wrapper replacing `highcharts-react-official` | New official wrapper; requires Highcharts >=12, React >=18; component-based API |

### UI + Styling
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@mui/material` | 6.x (pin 6.5.0) | Component library + theming | Ecosystem constraint; do NOT upgrade to v9 |
| `@mui/icons-material` | 6.x (pin 6.5.0) | Icon set | Matches insights-manager; used in PageHeader |
| `@emotion/react` | 11.x | CSS-in-JS runtime | Required by MUI v6; already in insights-manager |
| `@emotion/styled` | 11.x | Styled component API | Ecosystem constraint; all component styling uses `styled()` |
| `@viasat/insights-components` | (platform version from insights-manager node_modules: ^0.0.88) | Date picker, notifications, shared UI | Exports `DatePicker` component with start/end range state; platform-consistent |

### State + Data
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zustand` | 5.0.13 (latest) | View store + persist middleware | Ecosystem constraint; insights-manager uses 4.3.8 — v5 is current and the correct choice for a new project |
| `@tanstack/react-query` | 5.100.9 (latest) | Server state caching | Ecosystem constraint; this project uses v5 (insights-manager uses v4 — do not copy v4 patterns directly) |
| `@tanstack/react-query-devtools` | 5.x | Query devtools | Matched to React Query version |

### Routing + Utilities
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-router-dom` | 6.x | Client-side routing | Matches insights-manager v6.2.1 |
| `date-fns` | 3.x | Date arithmetic (14-day default calculation) | Preferred over Moment.js (deprecated) and dayjs; lighter than luxon for this use case |
| `uuid` | 9.x | Stable chart slot IDs | Required for Phase 5 custom chart builder; define the pattern in Phase 1 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite | CRA | CRA is unmaintained; last release 2023; Vite is the industry standard for new React projects |
| `@viasat/insights-components` DatePicker | `@mui/x-date-pickers` DateRangePicker | `@mui/x-date-pickers-pro` is required for DateRangePicker (license check needed); insights-components already ships a range picker — use it |
| Zustand v5 | Zustand v4 (matches insights-manager) | v5 has breaking changes (ESM-first); since this is a new standalone project, v5 is correct |
| React Query v5 | React Query v4 (matches insights-manager) | Same rationale — new project uses current version; adapt `useFetch` for v5 API |

**Installation:**
```bash
npm create vite@latest tail-history -- --template react-ts
cd tail-history
npm install highcharts @highcharts/react
npm install @mui/material@6 @mui/icons-material@6 @emotion/react @emotion/styled
npm install zustand @tanstack/react-query @tanstack/react-query-devtools
npm install react-router-dom date-fns uuid
npm install @viasat/insights-components
npm install --save-dev @types/uuid prettier
```

**Version verification (run before writing package.json):**
```bash
npm view highcharts version          # 12.6.0 (verified 2026-05-04)
npm view @highcharts/react version   # 4.2.1 (verified 2026-05-04)
npm view zustand version             # 5.0.13 (verified 2026-05-04)
npm view @tanstack/react-query version  # 5.100.9 (verified 2026-05-04)
npm view vite version                # 8.0.10 (verified 2026-05-04)
```

---

## Architecture Patterns

### Recommended Project Structure
```
tail-history/
├── public/
├── src/
│   ├── main.tsx              # Entry point — Highcharts.setOptions() called HERE before any React renders
│   ├── App.tsx               # QueryClientProvider, ThemeProvider, BrowserRouter
│   ├── index.css             # Global reset only (no component styles here)
│   ├── pages/
│   │   └── tailHistory/
│   │       ├── TailHistoryPage.tsx       # Page root — holds chartRegistryRef
│   │       ├── PageHeader.tsx            # Tail ID display + DatePicker
│   │       └── tailHistoryStore.ts       # Zustand store via createViewStore()
│   ├── components/           # Shared UI components (Phase 2+)
│   ├── endpoints/            # API endpoint definitions (Phase 3+)
│   ├── theme/
│   │   ├── Theme.tsx         # MUI createTheme — copy from insights-manager, update primary color if needed
│   │   └── colors.ts         # Re-export insights-manager palette + RAG constants
│   └── utils/
│       ├── createViewStore.ts  # Exact copy of insights-manager factory
│       └── useFetch.ts         # Adapted for React Query v5 (gcTime not cacheTime)
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### Pattern 1: Highcharts Global Defaults (Correctness-Critical)

**What:** `Highcharts.setOptions()` is called exactly once at app startup, before any `<Chart>` component is ever evaluated. This call sets global defaults for every chart instance created by this application.

**When to use:** Called in `src/main.tsx` (the Vite entry point), before `ReactDOM.createRoot().render()`.

**Example:**
```typescript
// src/main.tsx
// Source: CONTEXT.md D-04, UI-SPEC.md Highcharts Global Theme Contract
import Highcharts from 'highcharts/highstock';
import {createRoot} from 'react-dom/client';
import App from './App';

// MUST run before any React renders — cannot be moved into a component
Highcharts.setOptions({
  time: {useUTC: true},
  plotOptions: {
    series: {turboThreshold: 0}
  },
  chart: {
    style: {fontFamily: 'Source Sans Pro, sans-serif'},
    backgroundColor: 'transparent'
  },
  title: {style: {fontFamily: 'Uni Neue, sans-serif', fontWeight: '600'}},
  xAxis: {
    gridLineColor: '#DEE4E8',   // SURFACE_GREY[200]
    lineColor: '#DEE4E8',
    tickColor: '#DEE4E8',
    labels: {style: {color: '#465967', fontSize: '12px'}} // SURFACE_GREY[600]
  },
  yAxis: {
    gridLineColor: '#DEE4E8',
    labels: {style: {color: '#465967', fontSize: '12px'}}
  }
});

const root = document.getElementById('root')!;
createRoot(root).render(<App />);
```

Note: Hex values in `Highcharts.setOptions()` are the ONLY permitted hardcoded hex values outside `colors.ts` — Highcharts does not accept CSS custom properties. Comment each value with its `colors.ts` constant name.

### Pattern 2: createViewStore Factory (Exact Replica from insights-manager)

**What:** The Zustand view store factory wraps `create()` with `persist` middleware using a hybrid sessionStorage+localStorage backend. All Phase 1 store slices must be declared now — even those used only in later phases — because changing the store shape cascades into every consumer.

**When to use:** Call once per view: `const useTailHistoryStore = createViewStore(...)`.

**The factory** (copy exactly from `insights-manager/client/src/utils/createViewStore.ts` — confirmed source read):
```typescript
// src/utils/createViewStore.ts
import {StoreApi, UseBoundStore, create} from 'zustand';
import {StateStorage, createJSONStorage, persist} from 'zustand/middleware';

export const customStorage: StateStorage = {
  getItem: async (name) => sessionStorage.getItem(name) ?? localStorage.getItem(name),
  setItem: async (name, value) => {
    sessionStorage.setItem(name, value);
    localStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  }
};

export type BaseViewStoreActionsType = {reset: () => void};
export type LoadType = {loadUrlParams: (params: any) => void};

const viewStores: UseBoundStore<StoreApi<BaseViewStoreActionsType>>[] = [];

const createViewStore = <StateType, ActionType extends BaseViewStoreActionsType>(
  name: string,
  initialValues: StateType,
  hookActions: (setFn: (newState: Partial<StateType>) => void) => ActionType,
  dontPersist: string[]
) => {
  const store = create<StateType & ActionType & LoadType>()(
    persist(
      (set, get) => ({
        ...initialValues,
        ...hookActions(set as (newState: Partial<StateType>) => void),
        loadUrlParams: (params: any) => {
          const curState = get();
          const updateSet: Partial<StateType & ActionType & LoadType> = {};
          for (const [key, value] of Object.entries(curState)) {
            if (typeof value !== 'function') {
              const newValue = params[key];
              if (newValue) (updateSet as Record<string, any>)[key] = newValue;
            }
          }
          if (Object.keys(updateSet).length > 0) set(updateSet);
        }
      }),
      {
        name,
        storage: createJSONStorage(() => customStorage),
        partialize: partState =>
          Object.fromEntries(
            Object.entries(partState as Record<string, any>).filter(([key]) => !dontPersist.includes(key))
          )
      }
    )
  );
  viewStores.push(store);
  return store;
};

export const resetViewStores = () => {
  for (const store of viewStores) store.getState().reset();
};
export default createViewStore;
```

### Pattern 3: Tail History View Store

**What:** The specific store for this view. Declares ALL slices needed across all 5 phases — changing slice shape after Phase 2 is expensive. `zoomedRange`, `playhead`, `playback`, and `customCharts` are unused in Phase 1 but must be declared now.

**Example:**
```typescript
// src/pages/tailHistory/tailHistoryStore.ts
import createViewStore from '../../utils/createViewStore';

export interface TimeRange {
  start: number; // epoch ms
  end: number;   // epoch ms
}

export interface ZoomedRange {
  min: number;   // epoch ms
  max: number;   // epoch ms
}

export interface PlaybackState {
  isPlaying: boolean;
  speed: 0.5 | 1 | 2 | 4;
}

export interface ChartDefinition {
  id: string;            // stable UUID — React key, registry key
  metricId: string;
  chartType: 'line' | 'bar' | 'area' | 'scatter';
}

interface TailHistoryState {
  timeRange: TimeRange;
  zoomedRange: ZoomedRange | null;
  playhead: number | null;        // epoch ms; null = not set
  playback: PlaybackState;
  customCharts: ChartDefinition[];
}

const DEFAULT_RANGE_DAYS = 14;
const now = Date.now();
const initialState: TailHistoryState = {
  timeRange: {start: now - DEFAULT_RANGE_DAYS * 86400_000, end: now},
  zoomedRange: null,
  playhead: null,
  playback: {isPlaying: false, speed: 1},
  customCharts: []
};

// playhead and playback are NOT persisted — too volatile
const DONT_PERSIST = ['playhead', 'playback'];

const useTailHistoryStore = createViewStore(
  'tail-history-view',
  initialState,
  set => ({
    setTimeRange: (timeRange: TimeRange) => set({timeRange}),
    setZoomedRange: (zoomedRange: ZoomedRange | null) => set({zoomedRange}),
    setPlayhead: (playhead: number | null) => set({playhead}),
    setPlayback: (playback: Partial<PlaybackState>) =>
      set(state => ({playback: {...(state as any).playback, ...playback}})),
    addCustomChart: (chart: ChartDefinition) =>
      set(state => ({customCharts: [...(state as any).customCharts, chart]})),
    removeCustomChart: (id: string) =>
      set(state => ({customCharts: (state as any).customCharts.filter((c: ChartDefinition) => c.id !== id)})),
    reorderCustomCharts: (charts: ChartDefinition[]) => set({customCharts: charts}),
    reset: () => set(initialState)
  }),
  DONT_PERSIST
);

export default useTailHistoryStore;
```

### Pattern 4: Chart Instance Registry

**What:** `useRef<Map<string, Highcharts.Chart>>` held at `TailHistoryPage` level. Never in Zustand, never in React state. Register/unregister callbacks are passed as props to chart child components.

**When to use:** Phase 1 creates the shell. Phase 2 wires the first chart into it.

**Example:**
```typescript
// src/pages/tailHistory/TailHistoryPage.tsx (Phase 1 shell)
import {useRef, useCallback} from 'react';
import Highcharts from 'highcharts/highstock';

const TailHistoryPage: React.FC = () => {
  const chartRegistryRef = useRef<Map<string, Highcharts.Chart>>(new Map());

  const registerChart = useCallback((id: string, chart: Highcharts.Chart) => {
    chartRegistryRef.current.set(id, chart);
  }, []);

  const unregisterChart = useCallback((id: string) => {
    chartRegistryRef.current.delete(id);
  }, []);

  // chartRegistryRef.current is used in Phase 2+ useChartSync hook
  // registerChart / unregisterChart props passed to ChartStrip components

  return (/* page shell */);
};
```

### Pattern 5: useFetch Adapted for React Query v5

**What:** The insights-manager `useFetch` uses React Query v4 API. This new project uses v5. The key API change: `cacheTime` → `gcTime`.

**Example:**
```typescript
// src/utils/useFetch.ts — adapted for React Query v5
import {QueryClient, useQuery, UseQueryResult} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity  // v5 rename of cacheTime
    }
  }
});

// ...rest of useFetch pattern mirrors insights-manager exactly
// queryKey: [fetchParams.route, fetchParams.params]
// enabled: Boolean(fetchParams.params)  (null params = do not query)
// 401 response → logout
```

### Pattern 6: Date Picker with 14-Day Default

**What:** Use `DatePicker` from `@viasat/insights-components`. It provides `DatePickerState` with `startDate: string` and `endDate: string` and fires `onSetDateRange` on apply. On apply, call `queryClient.invalidateQueries()` to trigger refetch of all chart data.

**Confirmed API** (read from dist/components/datePicker/DatePicker.d.ts):
```typescript
// @viasat/insights-components DatePicker props
interface DatePickerState {
  endDate: string;
  startDate: string;
  persistStartDate?: boolean;
  persistEndDate?: boolean;
}

interface DatePickerProps {
  currentDateRange: DatePickerState;
  defaultOpen?: boolean;
  removeDatePickerGuardrails?: boolean;
  datePickerGuardrailLimitMonths?: number;
  getFullElementId: (name: string, type: string) => string;
  onSetDateRange: (newState: DatePickerState) => void;
  onShowHide?: (open: boolean) => void;
  rangeLimitDays?: number;
  allowFutureDate?: boolean;
  datePickerPresets?: IDefaultDateRangePresets[];
}
```

**Usage in PageHeader:**
```typescript
// 14-day default state initialization
const defaultStart = new Date(Date.now() - 14 * 86400_000).toISOString().split('T')[0]; // 'YYYY-MM-DD'
const defaultEnd = new Date().toISOString().split('T')[0];

const [dateRange, setDateRange] = useState<DatePickerState>({
  startDate: defaultStart,
  endDate: defaultEnd
});

const handleSetDateRange = (newRange: DatePickerState) => {
  setDateRange(newRange);
  // Convert string dates to epoch ms and write to Zustand
  const start = new Date(newRange.startDate).getTime();
  const end = new Date(newRange.endDate).getTime();
  setTimeRange({start, end});
  // Invalidate all chart queries so they refetch with new range
  queryClient.invalidateQueries();
};
```

### Pattern 7: App.tsx Shell (QueryClientProvider + Theme)

**What:** Providers wrap the entire application. `StyledEngineProvider injectFirst` ensures Emotion CSS overrides MUI's injected styles. ThemeProvider provides the MUI theme. QueryClientProvider provides React Query.

**Example:**
```typescript
// src/App.tsx — simplified for Phase 1
import {QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {StyledEngineProvider, ThemeProvider, CssBaseline} from '@mui/material';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {queryClient} from './utils/useFetch';
import theme from './theme/Theme';
import TailHistoryPage from './pages/tailHistory/TailHistoryPage';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/tail-history/:tailId" element={<TailHistoryPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </StyledEngineProvider>
  </QueryClientProvider>
);
```

### Pattern 8: Routing — Tail ID via URL Param

**What:** Tail ID is read from URL parameter `/tail-history/:tailId`. This follows insights-manager's `useUrlParams.ts` pattern where primary resource identifiers are path params, not query strings.

**Example:**
```typescript
// In TailHistoryPage.tsx
import {useParams} from 'react-router-dom';

const {tailId} = useParams<{tailId: string}>();
// If tailId is undefined, show empty state: "No tail selected"
```

### Pattern 9: colors.ts

**What:** The new project's `colors.ts` re-exports the platform palette and adds RAG connectivity status constants. The hex values below are read directly from the live insights-manager `colors.ts` file.

```typescript
// src/theme/colors.ts
// Re-export platform palette (values read from insights-manager/client/src/theme/colors.ts)
export const WHITE = '#FFF';
export const BLACK = '#000';
export const PRIMARY_GREY = '#32424E';
export const PRIMARY_PURPLE = '#724AE8';
export const PRIMARY_LIGHT_PURPLE = '#D4CFE1';
export const ERROR_RED = '#E73737';
export const ERROR_RED_TEXT = '#CD3209';
export const INPUT_BORDER = '#9FAFBC';
export const LIST_BACKGROUND = '#F2F5F8';
export const ACTIVE_ICON_BUTTON_OPACITY = 1;
export const INACTIVE_ICON_BUTTON_OPACITY = 0.4;

export const SURFACE_GREY = {
  50: '#FDFEFF',
  100: '#F2F5F8',
  150: '#E8ECF0',
  200: '#DEE4E8',
  400: '#9FAFBC',
  600: '#465967',
  900: '#1C262F',
  primary: {light: '#9FAFBC', main: '#465967', dark: '#1C262F'},
  secondary: {light: '#DEE4E8', main: '#9FAFBC', dark: '#465967'}
};

// RAG connectivity status colors — reserved for Phase 3 Events Timeline
// Exact hex values TBD from Figma node 310-148332 before Phase 3 implementation
export const RAG_CONNECTED = '#00C853';     // green — PLACEHOLDER, verify from Figma
export const RAG_ACQUIRING = '#FFB300';     // amber — PLACEHOLDER, verify from Figma
export const RAG_DISCONNECTED = '#E73737';  // red — matches ERROR_RED
```

### Anti-Patterns to Avoid

- **Calling `Highcharts.setOptions()` inside a component:** It will fire on every render and can conflict with component-level options. Call it ONCE in `main.tsx` before `createRoot().render()`.
- **Importing from both `highcharts` and `highcharts/highstock`:** TypeScript declaration conflicts make the project uncompilable. Pick one base (`highcharts/highstock`) and use it everywhere.
- **Storing chart instances in Zustand:** Highcharts chart objects are mutable and non-serializable. Zustand's devtools serializer will break. Use `useRef`.
- **Using array index as React key for chart slots:** When Phase 5 adds drag-to-reorder, index-keyed charts unmount/remount and destroy Highcharts instances. Establish UUID-keyed pattern now, even for the Phase 1 placeholder.
- **Copying useFetch from insights-manager verbatim:** That version uses React Query v4 `cacheTime`. The v5 API uses `gcTime`. Copying verbatim causes a TypeScript type error and silent runtime behavior change.
- **Hardcoding hex values in components:** Import from `colors.ts`. The only exception is `Highcharts.setOptions()` which cannot accept CSS variables.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date range picker with start/end inputs | Custom calendar UI | `@viasat/insights-components` `DatePicker` | Already shipped with correct guardrails, presets structure, and platform styling |
| Hybrid localStorage + sessionStorage | Custom storage adapter | `customStorage` in `createViewStore.ts` | Factory already handles the dual-write pattern with async API |
| React Query client setup | Manual cache config | `queryClient` exported from `useFetch.ts` | Centralized singleton; `QueryClientProvider` needs the same instance everywhere |
| Zustand persist middleware | Manual serialization | `createJSONStorage(() => customStorage)` | Factory handles partialize, dontPersist filtering, and reset |
| Highcharts React wrapper | `new Highcharts.Chart()` calls in components | `@highcharts/react` `<Chart>` component | Wrapper handles lifecycle, `chart.destroy()` on unmount, ref access |
| MUI theme from scratch | Copy-paste styles | Copy `Theme.tsx` from insights-manager | Font faces (Uni Neue, Source Sans Pro), component overrides, and palette are already correct |

**Key insight:** The insights-manager codebase has already solved the infrastructure problems for this domain. Phase 1 is about transplanting proven patterns into a new project, not inventing new ones.

---

## Common Pitfalls

### Pitfall 1: turboThreshold Silently Drops Data

**What goes wrong:** Highcharts defaults `turboThreshold` to 1,000 points per series. Aviation telemetry at 1-minute resolution over 14 days = 20,160 points per metric. Charts render with blank series lines, no JavaScript error.

**Why it happens:** Threshold triggers a faster-but-stricter parsing mode. Object-array data format `[{x, y}]` fails silently above threshold if the format is slightly wrong.

**How to avoid:** Set `plotOptions.series.turboThreshold: 0` in `Highcharts.setOptions()` — done once globally in `main.tsx`, before any chart renders.

**Warning signs:** Chart frame visible, series line missing. Problem appears only for date ranges > a few days.

### Pitfall 2: React Query v4 vs v5 API Differences

**What goes wrong:** The insights-manager `useFetch.ts` uses React Query v4 API. Copying it verbatim into a v5 project causes TypeScript errors at the `cacheTime` property (renamed `gcTime` in v5).

**Why it happens:** Breaking change in React Query v5 (October 2023): `cacheTime` → `gcTime`, `isLoading` now false while fetching with cached data (use `isFetching` instead), `useQuery` no longer accepts `onSuccess`/`onError` callbacks.

**How to avoid:** Adapt the `useFetch` pattern for v5: use `gcTime: Infinity`, remove any v4-only options. The `queryFn`, `queryKey`, `select`, and `enabled` parameters are unchanged.

**Warning signs:** TypeScript error "Object literal may only specify known properties, 'cacheTime' does not exist."

### Pitfall 3: Highcharts.setOptions() Called Too Late

**What goes wrong:** `Highcharts.setOptions()` is placed inside the `App` component body or inside `TailHistoryPage`. In React Strict Mode, components render twice in development. The first render fires before `setOptions()` and uses Highcharts defaults (turboThreshold: 1000, useUTC: false).

**Why it happens:** Component-level code runs after module-level imports but within React's render cycle. `main.tsx` module-level code runs before React renders anything.

**How to avoid:** Place `Highcharts.setOptions()` call in `main.tsx` at module level, before `createRoot().render()`.

**Warning signs:** Works in production build but fails in development. UTC setting appears inconsistent.

### Pitfall 4: Zustand v4 vs v5 API Differences

**What goes wrong:** Copying zustand patterns from insights-manager (which uses v4.3.8) to a project with zustand v5.0.13 may hit breaking changes. Zustand v5 is ESM-first and removed some CJS compatibility shims.

**Why it happens:** The `createViewStore` factory uses the `persist` middleware and `createJSONStorage` — these APIs are unchanged in v5. However, the `StateStorage` type interface changed slightly.

**How to avoid:** Copy the factory pattern as documented in this research document (sourced from the live file). The `customStorage` object's async `getItem`/`setItem`/`removeItem` signature is compatible with both v4 and v5.

**Warning signs:** TypeScript errors about `StateStorage` interface. Runtime errors about `createJSONStorage` argument.

### Pitfall 5: @viasat/insights-components DatePicker String Dates vs Epoch Ms

**What goes wrong:** The `DatePicker` component passes `DatePickerState` with `startDate: string` and `endDate: string` (ISO date strings like `"2026-04-20"`). The Zustand store's `timeRange` uses epoch milliseconds. Forgetting to convert causes silent type coercion.

**Why it happens:** The component API uses human-readable date strings; the chart/query system uses epoch ms for Highcharts xAxis and React Query keys.

**How to avoid:** In `onSetDateRange` handler, convert string dates to epoch ms before writing to store: `new Date(newRange.startDate).getTime()`.

**Warning signs:** Highcharts xAxis shows dates from 1970 (epoch 0 treated as invalid string). React Query cache key has string dates instead of numbers.

### Pitfall 6: Vite Environment Variable Naming

**What goes wrong:** CRA uses `REACT_APP_*` prefix for env vars. Vite uses `VITE_*` prefix. Any CLAUDE.md references to `REACT_APP_SKIP_SPA=true` do NOT apply to this Vite project.

**Why it happens:** Different build tool conventions. The CLAUDE.md instructions describe insights-manager (a CRA project).

**How to avoid:** Use `VITE_*` prefix for any env vars in this project. Access via `import.meta.env.VITE_*` (not `process.env.REACT_APP_*`).

---

## Code Examples

Verified patterns from source files read directly:

### Copyright Header (Every File)
```typescript
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
 * Description: [Brief description]
 */
```
Source: insights-manager/claude.md, confirmed in every source file read.

### Prettier Config
```json
// .prettierrc
{
  "singleQuote": true,
  "bracketSpacing": false,
  "trailingComma": "none",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "semi": true
}
```
Source: insights-manager/claude.md formatting rules.

### MUI Theme Copy Points

The insights-manager Theme.tsx provides these values to copy verbatim:
- `palette.background.default: SURFACE_GREY[100]` (`#F2F5F8`)
- `palette.text.primary: '#202E39'`
- `palette.text.secondary: '#202E39B2'` (70% alpha)
- `palette.divider: '#125A871F'`
- `typography.h6: { fontFamily: 'Uni Neue', fontWeight: '700' }` — this is the variant for the tail ID display
- `components.MuiIconButton.styleOverrides.root.padding: '0px'`
- `components.MuiButton.styleOverrides.root.borderRadius: 3000` (pill shape)
- Custom typography variant `'label'`: Source Sans Pro, fontWeight 600, fontSize 1.0rem

Note: `palette.primary.main` is `'#304FFE'` in insights-manager. The Tail History view may use `PRIMARY_PURPLE = '#724AE8'` as primary if it follows a different brand color. Verify with Figma.

### TailHistoryPage Shell Structure

```typescript
// src/pages/tailHistory/TailHistoryPage.tsx
import {useRef, useCallback} from 'react';
import {useParams, Navigate} from 'react-router-dom';
import {styled} from '@mui/material/styles';
import {Box} from '@mui/material';
import Highcharts from 'highcharts/highstock';
import PageHeader from './PageHeader';
import {SURFACE_GREY} from '../../theme/colors';

const PageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: SURFACE_GREY[100]
});

const ContentArea = styled(Box)({
  flex: 1,
  padding: '24px 32px'
});

const TailHistoryPage: React.FC = () => {
  const {tailId} = useParams<{tailId: string}>();
  const chartRegistryRef = useRef<Map<string, Highcharts.Chart>>(new Map());

  const registerChart = useCallback((id: string, chart: Highcharts.Chart) => {
    chartRegistryRef.current.set(id, chart);
  }, []);

  const unregisterChart = useCallback((id: string) => {
    chartRegistryRef.current.delete(id);
  }, []);

  if (!tailId) {
    return <EmptyState />;
  }

  return (
    <PageContainer>
      <PageHeader tailId={tailId} />
      <ContentArea>
        {/* Phase 1 placeholder — charts appear here in Phase 2+ */}
      </ContentArea>
    </PageContainer>
  );
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create React App | Vite | 2022-2024 | CRA deprecated; Vite is the React community standard for new projects |
| `highcharts-react-official` npm package | `@highcharts/react` npm package | Nov 2024 (Highcharts v12) | New wrapper required for Highcharts v12; old package still works but do not mix |
| `useQuery({ cacheTime })` (React Query v4) | `useQuery({ gcTime })` (React Query v5) | Oct 2023 | Breaking rename; v5 also removed `onSuccess`/`onError` from useQuery |
| `ReactDOM.render()` (React 17) | `createRoot().render()` (React 18) | 2022 | insights-manager uses the old API; this project uses the current one |
| Zustand v4 (insights-manager) | Zustand v5 (this project) | 2024 | ESM-first; createViewStore pattern is compatible |

**Deprecated/outdated (do not use in this project):**
- `highcharts-react-official`: Legacy package; replaced by `@highcharts/react` for Highcharts v12+
- `ReactDOM.render()`: React 17 API; use `createRoot().render()` (React 18)
- `REACT_APP_*` env vars: CRA convention; use `VITE_*` with Vite
- `moment` / `moment-timezone`: insights-manager has them as legacy; new project uses `date-fns`
- `react-scripts`: CRA build tool; this project uses Vite

---

## Open Questions

1. **@viasat/insights-components package registry access**
   - What we know: Package is at `^0.0.88` in insights-manager; it exists in `node_modules` there.
   - What's unclear: Whether the package is published to npm public registry or a private Viasat npm registry. If private, the new project needs `.npmrc` configuration to install it.
   - Recommendation: In the scaffold task, first attempt `npm install @viasat/insights-components`. If it fails with 404, check insights-manager's `.npmrc` for the registry URL and replicate it.

2. **Custom fonts (Uni Neue, Source Sans Pro) availability**
   - What we know: Both fonts are referenced in insights-manager's Theme.tsx. They appear to be loaded as web fonts.
   - What's unclear: Whether they are served from a CDN (and the URL), embedded as npm packages, or loaded from Viasat's internal CDN. The new project must load them the same way.
   - Recommendation: Check `insights-manager/client/public/index.html` or `index.css` for `@font-face` or `<link>` tags. Copy the same loading mechanism to the new project.

3. **RAG color exact values**
   - What we know: `RAG_CONNECTED`, `RAG_ACQUIRING`, `RAG_DISCONNECTED` are referenced in the UI-SPEC but no exact hex values were found in any source file.
   - What's unclear: The exact hex values come from "Figma node 310-148332" per the UI-SPEC. These are Phase 3 (Events Timeline) colors, not needed in Phase 1.
   - Recommendation: Define placeholder values in `colors.ts` with a `// PLACEHOLDER: verify from Figma node 310-148332` comment. Do not block Phase 1 on this.

4. **tailId validation regex**
   - What we know: insights-manager has `tailIdRegEx` in `api/src/routes/validators.ts`. Client-side URL param validation is not shown in the API code.
   - What's unclear: Whether the frontend should validate tail ID format before making API calls, or let the API return 400/404.
   - Recommendation: For Phase 1 (no API calls yet), accept any non-empty string as a valid tail ID. Add validation in Phase 3 when the first API call is made.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Build toolchain | Yes | v22.14.0 | — |
| npm | Package installation | Yes | 11.11.1 | — |
| Vite (via npm) | Project scaffold | Yes (npm installable) | 8.0.10 | — |
| `@viasat/insights-components` | DatePicker component | Unknown — requires npm registry check | ^0.0.88 | Two MUI `DatePicker` components (free tier) |
| Custom fonts (Uni Neue, Source Sans Pro) | Theme typography | Unknown — source not verified | — | System fallback fonts; verify font loading mechanism |

**Missing dependencies with no fallback:**
- None that block Phase 1 implementation.

**Missing dependencies with fallback:**
- `@viasat/insights-components`: If npm registry access fails, use two `@mui/x-date-pickers` `DatePicker` components (free tier, no pro license needed for individual pickers) as a temporary fallback. DateRangePicker requires `-pro`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react (to match Vite ecosystem) |
| Config file | `vite.config.ts` (vitest config embedded) or `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

Note: insights-manager uses Jest + Enzyme (CRA ecosystem). This Vite project should use Vitest — it is Jest-compatible API-wise and integrates natively with Vite's transform pipeline. The test patterns (snapshot tests, mocked useFetch, data-testid selectors) are the same.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| FOUND-01 | App renders without crashing at `/tail-history/N12345` | smoke | `npx vitest run src/__tests__/App.test.tsx` | No — Wave 0 |
| FOUND-02 | `Highcharts.getOptions()` returns `useUTC: true` and `turboThreshold: 0` after app init | unit | `npx vitest run src/__tests__/highchartsConfig.test.ts` | No — Wave 0 |
| FOUND-03 | `useTailHistoryStore` initializes with correct slice shapes; `setTimeRange` updates only `timeRange` | unit | `npx vitest run src/__tests__/tailHistoryStore.test.ts` | No — Wave 0 |
| FOUND-04 | `PageHeader` renders with a date range defaulting to last 14 days; applying new range calls `queryClient.invalidateQueries` | integration | `npx vitest run src/__tests__/PageHeader.test.tsx` | No — Wave 0 |
| FOUND-05 | `TailHistoryPage` exposes `registerChart` / `unregisterChart` callbacks; calling them modifies `chartRegistryRef.current` | unit | `npx vitest run src/__tests__/TailHistoryPage.test.tsx` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps (test infrastructure to create before implementation tasks)
- [ ] `src/__tests__/App.test.tsx` — covers FOUND-01
- [ ] `src/__tests__/highchartsConfig.test.ts` — covers FOUND-02
- [ ] `src/__tests__/tailHistoryStore.test.ts` — covers FOUND-03
- [ ] `src/__tests__/PageHeader.test.tsx` — covers FOUND-04
- [ ] `src/__tests__/TailHistoryPage.test.tsx` — covers FOUND-05
- [ ] `src/setupTests.ts` — shared test configuration (mock window.localStorage, mock @viasat/insights-components)
- [ ] Framework install: `npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom`

---

## Sources

### Primary (HIGH confidence)
- `insights-manager/client/src/utils/createViewStore.ts` — factory source read directly; pattern replicated verbatim
- `insights-manager/client/src/utils/useFetch.ts` — v4 useFetch source read directly; v5 adaptation documented
- `insights-manager/client/src/theme/colors.ts` — all hex values read directly
- `insights-manager/client/src/theme/Theme.tsx` — all theme configuration read directly
- `insights-manager/client/src/pages/Pages.tsx` — routing pattern confirmed
- `insights-manager/client/src/utils/useBearStore.ts` — global store pattern confirmed
- `insights-manager/claude.md` — copyright header format, Prettier config, component structure rules
- `insights-manager/client/node_modules/@viasat/insights-components/dist/components/datePicker/DatePicker.d.ts` — DatePicker API confirmed from dist types
- `.planning/research/ARCHITECTURE.md` — chart registry pattern, store architecture, data flow
- `.planning/research/PITFALLS.md` — setExtremes feedback loop, turboThreshold, rAF stale closure
- `npm view` commands (2026-05-04 verified): highcharts 12.6.0, @highcharts/react 4.2.1, zustand 5.0.13, @tanstack/react-query 5.100.9, vite 8.0.10, @mui/x-date-pickers v6 series available

### Secondary (MEDIUM confidence)
- CLAUDE.md (project instructions) — tech stack constraints, copyright requirement, no-Redux mandate
- UI-SPEC.md (01-UI-SPEC.md) — layout spec, spacing, typography, color roles, Highcharts setOptions exact values

### Tertiary (LOW confidence)
- Font loading mechanism for Uni Neue / Source Sans Pro — not verified; follow-up needed by reading `insights-manager/client/public/index.html`
- `@viasat/insights-components` npm registry access from a new project — not verified; may require `.npmrc`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions npm-verified 2026-05-04; ecosystem constraints confirmed from CLAUDE.md
- Architecture: HIGH — patterns read directly from live source files; createViewStore factory copied verbatim
- Pitfalls: HIGH — all critical pitfalls sourced from prior research (PITFALLS.md) which cited official docs
- DatePicker API: HIGH — read directly from dist type definitions in node_modules

**Research date:** 2026-05-04
**Valid until:** 2026-08-04 (stable libraries; Highcharts 12 is stable; React Query v5 is stable)
