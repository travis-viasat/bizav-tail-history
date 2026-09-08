---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [vite, react, typescript, highcharts, mui, zustand, react-query, emotion, vitest, jsdom]

# Dependency graph
requires: []
provides:
  - Vite+React+TypeScript project scaffold in tail-history/
  - All npm dependencies installed (highcharts, @highcharts/react, @mui/material@6, zustand, @tanstack/react-query, react-router-dom, vitest, etc.)
  - Highcharts global defaults set before React mount (useUTC:true, turboThreshold:0)
  - MUI theme matching insights-manager (createTheme with label variant, responsiveFontSizes)
  - Color constants including SURFACE_GREY and RAG placeholders
  - App provider shell (QueryClientProvider, ThemeProvider, BrowserRouter, /tail-history/:tailId route)
  - Wave 0 test stubs for FOUND-01 and FOUND-02 (all passing)
  - Font files (Uni Neue + Source Sans Pro) copied from insights-manager
affects: [02-page-shell, 03-default-charts, 04-zoom-sync, 05-playback, 06-custom-chart-builder]

# Tech tracking
tech-stack:
  added:
    - highcharts@12.x (highstock variant)
    - "@highcharts/react@4.2.1"
    - "@mui/material@6"
    - "@mui/icons-material@6"
    - "@emotion/react + @emotion/styled"
    - "zustand@5"
    - "@tanstack/react-query@5 + react-query-devtools"
    - "react-router-dom"
    - "date-fns"
    - "uuid"
    - "vitest + @vitest/coverage-v8"
    - "@testing-library/react + @testing-library/jest-dom"
    - "jsdom"
    - "prettier"
  patterns:
    - Highcharts global defaults set in main.tsx before createRoot (D-04)
    - highcharts/highstock import (not highcharts) for Highstock navigator support (D-05)
    - Highcharts v12 TimeOptions type augmentation to preserve useUTC property
    - CSS.supports polyfill in setupTests.ts for Highcharts v12 + jsdom compatibility
    - MUI theme via createTheme + responsiveFontSizes exported from src/theme/Theme.tsx
    - Color constants imported from src/theme/colors.ts (never hardcoded in components)
    - QueryClient with staleTime:Infinity + gcTime:Infinity (React Query v5 API)
    - App.tsx provider nesting: QueryClientProvider > StyledEngineProvider > ThemeProvider > BrowserRouter

key-files:
  created:
    - tail-history/package.json
    - tail-history/vite.config.ts
    - tail-history/tsconfig.app.json
    - tail-history/tsconfig.node.json
    - tail-history/.prettierrc
    - tail-history/index.html
    - tail-history/public/unineue.css
    - tail-history/public/sourcesanspro.css
    - tail-history/public/fonts/uni-neue/*.otf (7 files)
    - tail-history/public/fonts/source-sans/*.otf (12 files)
    - tail-history/src/main.tsx
    - tail-history/src/App.tsx
    - tail-history/src/index.css
    - tail-history/src/vite-env.d.ts
    - tail-history/src/setupTests.ts
    - tail-history/src/theme/Theme.tsx
    - tail-history/src/theme/colors.ts
    - tail-history/src/__tests__/highchartsConfig.test.ts
    - tail-history/src/__tests__/App.test.tsx
  modified: []

key-decisions:
  - "Highcharts v12 removed useUTC from TimeOptions TypeScript types — augmented the interface in main.tsx to restore the property while also setting timezone:'UTC' for v12 compatibility"
  - "CSS.supports polyfilled in setupTests.ts (not in vite.config or externally) — surgical fix that only affects test environment"
  - "@viasat/insights-components skipped (404 from private registry) — per plan, Plan 02 will handle DatePicker fallback"
  - "vitest/config type added to tsconfig.node.json to resolve test property type error in vite.config.ts"

patterns-established:
  - "Pattern 1: Highcharts always imported as highcharts/highstock — never bare highcharts"
  - "Pattern 2: Highcharts.setOptions() in main.tsx BEFORE createRoot — correctness-critical, never in components"
  - "Pattern 3: All colors imported from src/theme/colors.ts — hex literals forbidden in components (except Highcharts setOptions)"
  - "Pattern 4: React Query v5 API: gcTime not cacheTime, staleTime:Infinity for all queries"

requirements-completed: [FOUND-01, FOUND-02]

# Metrics
duration: 21min
completed: 2026-05-05
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Vite+React+TypeScript project with Highcharts/highstock global defaults (useUTC:true, turboThreshold:0), MUI v6 theme matching insights-manager, and Wave 0 tests for FOUND-01/FOUND-02 — all passing**

## Performance

- **Duration:** 21 min
- **Started:** 2026-05-05T05:18:48Z
- **Completed:** 2026-05-05T05:39:57Z
- **Tasks:** 2 completed
- **Files modified:** 19 source files created + 19 font/asset files

## Accomplishments
- Complete Vite+React+TypeScript project scaffold with all required dependencies installed (highcharts@12, @highcharts/react@4.2.1, @mui/material@6, zustand@5, @tanstack/react-query@5, react-router-dom, vitest, etc.)
- Highcharts global defaults correctly set in main.tsx before createRoot — useUTC:true and turboThreshold:0 will persist for all chart instances in the app
- MUI theme (Theme.tsx) and color constants (colors.ts) exactly matching insights-manager, with RAG status placeholders added
- Wave 0 tests (FOUND-01 and FOUND-02) both pass: App renders without crashing, Highcharts setOptions side effects verified
- Font files (Uni Neue, Source Sans Pro) and CSS loaded from /public matching insights-manager patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite project, install dependencies, create config and font files** - `0fd4a40` (feat)
2. **Task 2: Create main.tsx, App.tsx, Theme.tsx, colors.ts, and Wave 0 test stubs** - `6da8306` (feat)

**Plan metadata:** (to be created)

## Files Created/Modified
- `tail-history/src/main.tsx` - Entry point with Highcharts.setOptions + createRoot
- `tail-history/src/App.tsx` - Provider shell: QueryClientProvider, ThemeProvider, BrowserRouter with /tail-history/:tailId route
- `tail-history/src/theme/Theme.tsx` - Full MUI theme with label typography variant, all component overrides
- `tail-history/src/theme/colors.ts` - Color constants (SURFACE_GREY, PRIMARY_PURPLE, RAG_* placeholders)
- `tail-history/src/setupTests.ts` - Vitest setup with jest-dom and CSS.supports polyfill
- `tail-history/src/__tests__/highchartsConfig.test.ts` - Wave 0 Highcharts config verification (FOUND-02)
- `tail-history/src/__tests__/App.test.tsx` - Wave 0 App smoke test (FOUND-01)
- `tail-history/vite.config.ts` - Vite config with embedded Vitest (jsdom, setupFiles)
- `tail-history/.prettierrc` - Prettier config matching insights-manager conventions
- `tail-history/index.html` - HTML entry with font links
- `tail-history/public/unineue.css` + `tail-history/public/sourcesanspro.css` - Font face declarations

## Decisions Made
- **Highcharts v12 TimeOptions type augmentation:** `useUTC` was removed from Highcharts v12 TypeScript types (in favour of `timezone: 'UTC'`). Augmented the interface in both `main.tsx` and the test file to restore the property. Both `useUTC: true` and `timezone: 'UTC'` are set to ensure runtime and type-safe UTC enforcement.
- **CSS.supports polyfill in setupTests.ts:** Highcharts v12 calls `CSS.supports()` at module initialization, which jsdom doesn't implement. Added a minimal polyfill in setupTests.ts (not globally) to fix the test environment without affecting production.
- **@viasat/insights-components skipped:** Private registry returns 404. Deferred to Plan 02 per plan instructions.
- **vitest/config in tsconfig.node.json:** The `test` property in vite.config.ts requires Vitest types. Added `vitest/config` to tsconfig.node.json `types` array to resolve the TypeScript build error.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Highcharts v12 removed `useUTC` from TimeOptions TypeScript type**
- **Found during:** Task 2 (Create main.tsx with Highcharts globals)
- **Issue:** Highcharts v12 dropped `useUTC` from the `TimeOptions` interface (moved to `timezone: 'UTC'`). The property still works at runtime but TypeScript build fails with `TS2353`.
- **Fix:** Added `declare module 'highcharts' { interface TimeOptions { useUTC?: boolean; } }` augmentation in main.tsx and the test file. Also set `timezone: 'UTC'` alongside `useUTC: true` for full v12 compatibility.
- **Files modified:** `tail-history/src/main.tsx`, `tail-history/src/__tests__/highchartsConfig.test.ts`
- **Verification:** `npm run build` passes; `npx vitest run` verifies `options.time?.useUTC === true` at runtime
- **Committed in:** 6da8306 (Task 2 commit)

**2. [Rule 1 - Bug] Highcharts v12 uses CSS.supports() — not available in jsdom**
- **Found during:** Task 2 (run vitest)
- **Issue:** `highchartsConfig.test.ts` failed with `TypeError: t1.CSS?.supports is not a function` — Highcharts v12 calls `CSS.supports()` during module initialization, which jsdom doesn't implement.
- **Fix:** Added `CSS.supports` polyfill in `setupTests.ts` returning `false` for all queries.
- **Files modified:** `tail-history/src/setupTests.ts`
- **Verification:** All 4 Wave 0 tests pass after polyfill
- **Committed in:** 6da8306 (Task 2 commit)

**3. [Rule 3 - Blocking] vite.config.ts TypeScript build error for `test` property**
- **Found during:** Task 1 verification (npm run build)
- **Issue:** TypeScript reported `'test' does not exist in type 'UserConfigExport'` because vite.config.ts is compiled by tsconfig.node.json which lacked `vitest/config` types.
- **Fix:** Added `"vitest/config"` to `types` array in `tsconfig.node.json`. Also added `/// <reference types="vitest" />` to vite.config.ts.
- **Files modified:** `tail-history/tsconfig.node.json`, `tail-history/vite.config.ts`
- **Verification:** `npm run build` passes without TypeScript errors
- **Committed in:** 0fd4a40 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (2 Rule 1 - Bug, 1 Rule 3 - Blocking)
**Impact on plan:** All auto-fixes required for build and test correctness. No scope creep. All changes align with Highcharts v12 migration path.

## Issues Encountered
- None beyond the auto-fixed deviations above.

## Known Stubs
- `tail-history/src/App.tsx` line 39: `element={<div>Tail History Shell</div>}` — placeholder for Plan 02 which will wire `<TailHistoryPage />`
- `tail-history/src/theme/colors.ts` RAG constants: `RAG_CONNECTED`, `RAG_ACQUIRING`, `RAG_DISCONNECTED` are placeholder hex values. Comment states: "verify from Figma node 310-148332 before Phase 3". These are intentional stubs — the plan notes they must be verified against Figma before Phase 3.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Foundation complete: all dependencies installed, build passes, tests pass
- Plan 02 (Page Shell) can proceed — it will replace the `<div>` placeholder with `<TailHistoryPage />`
- `@viasat/insights-components` unavailable from private registry — Plan 02 must implement DatePicker fallback as specified
- RAG colors to be verified from Figma before Phase 3 begins

---
*Phase: 01-foundation*
*Completed: 2026-05-05*
