# Phase 1: Foundation - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase creates the project scaffold and all shared infrastructure that every future phase depends on. No user-visible features ship in Phase 1 — the output is a running React app with the correct store shape, HighCharts global config, date range picker, and chart registry. Custom chart builder (Phase 5) and all charts (Phase 3) cannot be built correctly without these foundations being right first.

</domain>

<decisions>
## Implementation Decisions

### Project Vision
- **D-01:** The primary purpose of this entire project is enabling users to pick from 80+ metrics and build custom connectivity charts. All infrastructure decisions should optimize for this workflow.
- **D-02:** Phase 1 is pure infrastructure — no user-visible chart features ship yet. Success means a running app shell with correct plumbing.

### Technical Foundations (all locked by architecture research)
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Platform Patterns
- `insights-manager/client/src/utils/createViewStore.ts` — Zustand view store factory; replicate this pattern exactly
- `insights-manager/client/src/utils/useFetch.ts` — React Query wrapper; all API calls must use this pattern
- `insights-manager/client/src/utils/useBearStore.ts` — Global Zustand store reference
- `insights-manager/client/src/theme/colors.ts` — Color constants; never hardcode hex values
- `insights-manager/client/src/pages/Pages.tsx` — Routing pattern to follow
- `insights-manager/claude.md` — Full code conventions (Prettier, ESLint, copyright header format, MUI rules)

### Project Planning
- `.planning/PROJECT.md` — Vision, constraints, key decisions
- `.planning/REQUIREMENTS.md` — FOUND-01 through FOUND-05 define Phase 1 scope
- `.planning/research/ARCHITECTURE.md` — Component boundaries, state architecture, chart registry pattern
- `.planning/research/PITFALLS.md` — Critical: turboThreshold pitfall, import bundle mixing, global defaults timing
- `.planning/research/STACK.md` — Confirmed library versions and rationale

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createViewStore.ts`: The exact factory to replicate for the tail history view store. Uses Zustand persist middleware with sessionStorage/localStorage hybrid. Copy the pattern — don't rewrite it.
- `useFetch.ts`: React Query wrapper with automatic 401 logout. All data fetching must go through this.
- `colors.ts`: Theme color constants. New project needs its own `colors.ts` that includes RAG colors (red/amber/green for connectivity status) plus the standard Insights palette.

### Established Patterns
- Copyright header: Every file must have the Viasat copyright block at the top (year: 2026)
- Emotion styled(): All component styling via `styled()` — no CSS modules, no inline style objects with hardcoded values
- MUI v6: Import from `@mui/material` only — never `@material-ui/core`
- Prettier: single quotes, no trailing commas, 120 print width, 2-space indent, semicolons required

### Integration Points
- New project is standalone but should mirror the insights-manager folder structure: `src/pages/`, `src/components/`, `src/endpoints/`, `src/theme/`, `src/utils/`
- The TailHistory page component is the root that holds the chart instance registry ref and renders all child chart components

</code_context>

<specifics>
## Specific Ideas

- The custom chart builder is the primary purpose of this project — the entire infrastructure is being built to support that workflow. When in doubt about a design decision, ask: "does this make the custom chart builder easier to build in Phase 5?"
- The chart instance registry must be designed with the custom chart builder in mind — charts added dynamically by the user must be able to register/deregister without breaking the sync loop

</specifics>

<deferred>
## Deferred Ideas

- Date range presets (7d, 30d, 90d quickpicks) — user didn't express a preference; Claude decides
- Page header layout (tail number display, airline info) — not discussed; Claude implements something reasonable matching Figma
- Tail ID routing strategy (URL param vs query string) — not discussed; Claude decides based on platform conventions

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-05-04*
