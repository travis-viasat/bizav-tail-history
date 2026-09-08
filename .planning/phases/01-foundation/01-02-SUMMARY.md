---
phase: 01-foundation
plan: 02
subsystem: tail-history-frontend
tags: [zustand, react-query, typescript, date-picker, chart-registry]
dependency_graph:
  requires: ["01-01"]
  provides: ["01-03"]
  affects: ["all future plans — store shape is the contract"]
tech_stack:
  added:
    - "createViewStore factory (Zustand + persist middleware) — exact replica of insights-manager pattern"
    - "useFetch v5 adapter (React Query v5, gcTime, no onSuccess/onError)"
    - "tailHistoryStore with 5 slices"
    - "MUI TextField date picker fallback (no @viasat/insights-components)"
  patterns:
    - "SetFn<StateType> overloaded type for Zustand set to support both Partial<State> and updater functions"
    - "vi.hoisted() for Vitest mock factories that reference module-scope variables"
key_files:
  created:
    - tail-history/src/utils/createViewStore.ts
    - tail-history/src/utils/useFetch.ts
    - tail-history/src/pages/tailHistory/tailHistoryStore.ts
    - tail-history/src/pages/tailHistory/TailHistoryPage.tsx
    - tail-history/src/pages/tailHistory/PageHeader.tsx
    - tail-history/src/__tests__/tailHistoryStore.test.ts
    - tail-history/src/__tests__/TailHistoryPage.test.tsx
    - tail-history/src/__tests__/PageHeader.test.tsx
  modified:
    - tail-history/src/App.tsx
decisions:
  - "MUI TextField fallback for date picker (not @viasat/insights-components) — package unavailable from private registry; documented in STATE.md as known gap"
  - "SetFn<StateType> overload added to createViewStore — TypeScript verbatimModuleSyntax requires explicit type-only imports; Zustand set updater functions need union overload to satisfy strict TypeScript"
  - "vi.hoisted() used in PageHeader.test.tsx — Vitest hoists vi.mock() calls before module scope variable initialization; vi.hoisted() is the canonical fix"
metrics:
  duration: "13 minutes"
  completed: "2026-05-05"
  tasks_completed: 2
  tasks_total: 3
  files_created: 8
  files_modified: 1
---

# Phase 1 Plan 02: Page Shell (Zustand Store + Page Components) Summary

**One-liner:** Zustand view store with 5 slices, React Query v5 useFetch adapter, TailHistoryPage with chart registry ref, and MUI TextField date picker with 14-day default — all wired end-to-end with 18 passing tests.

## What Was Built

### Task 1: createViewStore factory, useFetch v5 adapter, tailHistoryStore

**`tail-history/src/utils/createViewStore.ts`** — Exact replica of the insights-manager factory pattern. Uses Zustand `persist` middleware with a dual-write `customStorage` (sessionStorage + localStorage). Exported: `customStorage`, `resetViewStores`, `default createViewStore`. Added `SetFn<StateType>` overloaded type to support both `Partial<State>` and `(state) => Partial<State>` updater forms (required for actions that merge partial sub-objects like `setPlayback`).

**`tail-history/src/utils/useFetch.ts`** — React Query v5 adapter. Key changes from insights-manager v4 pattern: `cacheTime` → `gcTime`, removed `onSuccess`/`onError` callbacks, exported `queryClient` singleton so PageHeader can call `invalidateQueries()` directly. Removed platform-specific `apiBase`/`logout`/`LogUtils` dependencies.

**`tail-history/src/pages/tailHistory/tailHistoryStore.ts`** — Zustand view store with all 5 slices:
- `timeRange: TimeRange` — epoch ms start/end, defaults to last 14 days
- `zoomedRange: ZoomedRange | null` — null until user drag-zooms a chart
- `playhead: number | null` — current scrubber position (epoch ms)
- `playback: PlaybackState` — `{isPlaying: false, speed: 1}` initially
- `customCharts: ChartDefinition[]` — empty array initially

Actions: `setTimeRange`, `setZoomedRange`, `setPlayhead`, `setPlayback`, `addCustomChart`, `removeCustomChart`, `reorderCustomCharts`, `reset`. DONT_PERSIST = `['playhead', 'playback']`.

**`tail-history/src/App.tsx`** — Removed inline `queryClient` definition; now imports singleton from `./utils/useFetch`. Route still unchanged shape but now uses `TailHistoryPage`.

### Task 2: TailHistoryPage and PageHeader

**`tail-history/src/pages/tailHistory/TailHistoryPage.tsx`** — Page root. Holds `chartRegistryRef = useRef<Map<string, Highcharts.Chart>>(new Map())`. Exposes `registerChart(id, chart)` and `unregisterChart(id)` callbacks via `useCallback`. Renders `<PageHeader tailId={tailId} />` and a placeholder content area. Empty state ("No tail selected") shown when `tailId` is undefined.

**`tail-history/src/pages/tailHistory/PageHeader.tsx`** — MUI TextField fallback (see Deviations). Displays tail ID in `<Typography variant="h6" data-testid="tail-id-display">`. Two date inputs (start/end) defaulting to 14 days ago / today. "Apply" button calls `setTimeRange({start, end})` and `queryClient.invalidateQueries()`.

### Tests

All 18 tests across 5 test files pass:
- `tailHistoryStore.test.ts`: 8 tests — FOUND-03 (store slices, setTimeRange isolation, reset)
- `TailHistoryPage.test.tsx`: 3 tests — FOUND-05 (URL param rendering, empty state, registry callbacks)
- `PageHeader.test.tsx`: 3 tests — FOUND-04 (tail ID display, 14-day default, invalidateQueries call)
- `highchartsConfig.test.ts`: 3 tests — FOUND-02 (pre-existing)
- `App.test.tsx`: 1 test — FOUND-01 (pre-existing)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vi.mock hoisting failure in PageHeader.test.tsx**
- **Found during:** Task 2 — first test run
- **Issue:** `const mockInvalidateQueries = vi.fn()` was defined at module scope, but Vitest hoists `vi.mock(...)` above all module-scope code. This caused `ReferenceError: Cannot access 'mockInvalidateQueries' before initialization`.
- **Fix:** Used `vi.hoisted()` to declare the mock function in the hoisted scope: `const {mockInvalidateQueries} = vi.hoisted(() => ({mockInvalidateQueries: vi.fn()}))`. This is the canonical Vitest pattern for this situation.
- **Files modified:** `tail-history/src/__tests__/PageHeader.test.tsx`
- **Commit:** included in a946088

**2. [Rule 1 - Bug] Fixed TypeScript verbatimModuleSyntax errors in createViewStore.ts and useFetch.ts**
- **Found during:** Task 2 — production build (`npm run build`)
- **Issue:** TypeScript's `verbatimModuleSyntax` compiler option (enabled in tsconfig) requires types to be imported with `import type` when the import is type-only. `StoreApi`, `UseBoundStore`, `StateStorage`, and `UseQueryResult` were imported as values but used only as types.
- **Fix:** Split imports into value imports and `import type` imports in both files.
- **Files modified:** `tail-history/src/utils/createViewStore.ts`, `tail-history/src/utils/useFetch.ts`
- **Commit:** included in a946088

**3. [Rule 1 - Bug] Fixed Zustand set updater function TypeScript errors in tailHistoryStore.ts**
- **Found during:** Task 2 — production build
- **Issue:** The plan's `createViewStore` factory typed `setFn` as `(newState: Partial<StateType>) => void`, but several actions (`setPlayback`, `addCustomChart`, `removeCustomChart`) needed updater functions `(state) => Partial<StateType>`. TypeScript rejected the updater form.
- **Fix:** Added `SetFn<StateType>` union overload type to `createViewStore`:
  ```typescript
  type SetFn<StateType> = {
    (newState: Partial<StateType>): void;
    (updater: (state: StateType) => Partial<StateType>): void;
  };
  ```
  Also removed `(state as any)` casts from tailHistoryStore.ts actions since the proper type now applies.
- **Files modified:** `tail-history/src/utils/createViewStore.ts`, `tail-history/src/pages/tailHistory/tailHistoryStore.ts`
- **Commit:** included in a946088

### @viasat/insights-components Unavailable (Known — Documented in STATE.md)

The plan's PageHeader implementation offered a fallback when `@viasat/insights-components` is unavailable (STATE.md decision from Plan 01 noted this). The fallback uses two MUI `TextField type="date"` inputs plus an "Apply" button. This is intentional and documented — not a deviation.

The `PageHeader.test.tsx` was adapted to test the TextField fallback behavior (input values, apply button click) rather than the plan's `vi.mock('@viasat/insights-components', ...)` approach, since that package doesn't exist.

## Known Stubs

**"Charts will load here in Phase 2." placeholder text**
- File: `tail-history/src/pages/tailHistory/TailHistoryPage.tsx`, line ~60
- Reason: Intentional Phase 1 placeholder. Chart strips are wired in Plan 03 (Phase 2).

**Chart registry callbacks (`registerChart`, `unregisterChart`) not yet passed as props**
- File: `tail-history/src/pages/tailHistory/TailHistoryPage.tsx`
- Reason: Intentional — Phase 2 will wire these to ChartStrip components. The callbacks are defined correctly; props are added when consumers exist.

## Task 3: Checkpoint Pending

Task 3 is `type="checkpoint:human-verify"` — requires manual browser verification. The dev server can be started with `cd tail-history && npm run dev` and the app verified at http://localhost:3000/tail-history/N12345.

## Self-Check: PASSED
