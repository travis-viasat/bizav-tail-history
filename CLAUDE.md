<!-- GSD:project-start source:PROJECT.md -->
## Project

**Tail History View — Insights**

A new standalone frontend view for the Insights aviation analytics platform (insights.viasat.com) that allows users to review the connectivity and network history for a specific aircraft tail. It shows recent flight paths on an interactive map with RAG-colored connectivity status, a rich set of default charts covering connectivity metrics, and a user-configurable custom chart builder for deep-dive analysis.

**Core Value:** Aviation customers must be able to build and zoom custom connectivity charts across any time window — this is the primary analytical workflow that differentiates the Tail History view from existing tools.

### Constraints

- **Tech Stack**: React + TypeScript + MUI v6 + HighCharts — must remain consistent with the Insights ecosystem
- **Component Library**: Use `@viasat/insights-components` for shared UI (grids, menus, notifications, etc.)
- **Copyright**: Every source file must include the Viasat copyright header (© 2026 Viasat, Inc.)
- **State Management**: Zustand for global state (`useBearStore`), `createViewStore()` for view-specific state — no Redux or React Context
- **Data Fetching**: TanStack React Query via `useFetch` hook pattern — no raw `fetch` or `axios`
- **Styling**: Emotion `styled()` or MUI `styled()` — no CSS modules, no hardcoded hex colors (import from `colors.ts`)
- **No hard deadline** — planning phase, no committed ship date yet
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 18.x (current in platform) | UI rendering | Ecosystem constraint — Insights platform is on React 18. React 19 is not yet required by any dependency. |
| TypeScript | 5.x | Type safety | Ecosystem constraint — all Insights code is TypeScript. |
| MUI (Material UI) | v6.x | Component library + theming | Ecosystem constraint — PROJECT.md mandates MUI v6. Note: MUI latest is v9, but the platform pins v6. Do not upgrade. |
| Emotion (`@emotion/styled`) | v11.x | CSS-in-JS styling | Ecosystem constraint — PROJECT.md mandates Emotion `styled()`. No CSS modules, no hardcoded hex colors. |
### Charting
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Highcharts | 12.x (latest: 12.6.0) | Core charting engine | Ecosystem constraint — Insights already uses Highcharts. v12 is current (released Nov 2024). Major change: Series class now uses DataTable instead of parallel arrays. |
| `@highcharts/react` | 4.2.1 | Official React wrapper | This is the NEW official wrapper, replacing the legacy `highcharts-react-official` package. Requires Highcharts >=12.0.0 and React >=18. Uses component-based API (`<Chart>`, `<Series>`, `<Title>`) rather than the legacy options-object-only approach. |
- **X-range series** (`modules/xrange.js`) — Included in core Highcharts license. Renders horizontal bars between start/end times. Recommended for this use case. No extra license needed.
- **Highcharts Gantt** — A separate, separately-licensed product. Do NOT use for this project unless Viasat already holds a Gantt license. Confirm with procurement before using `highcharts-gantt.js`.
- `highcharts-react-official` — Legacy package, no longer the official wrapper. The new `@highcharts/react` replaces it. Do not mix both.
- Highcharts Gantt module — Requires separate license. Use x-range series instead.
- D3.js, Recharts, Victory, Chart.js — Not in the Insights ecosystem. Do not introduce a second charting library.
### Map
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-map-gl` (MapLibre endpoint) | 8.1.1 | React wrapper for map | Industry standard wrapper with both Mapbox and MapLibre backends. Supports React 18+. Import from `react-map-gl/maplibre` to use MapLibre. |
| `maplibre-gl` | 5.x (current: 5.24.0) | Map rendering engine | Open-source fork of Mapbox GL JS. Free, no token required, actively maintained by MapLibre community. Supports animated line layers, data-driven styling for RAG-colored route segments, custom tile layers. |
| MapTiler (map tiles) | Cloud free tier | Base map tiles | Free satellite hybrid style available at `cloud.maptiler.com`. Provides satellite imagery + labels suitable for aviation route visualization. Requires free API key. |
| Option | Verdict | Reason |
|--------|---------|--------|
| **MapLibre GL JS + react-map-gl** | RECOMMENDED | Open source, free, no usage-based pricing, WebGL rendering, data-driven styling for RAG line segments, active community |
| Leaflet + react-leaflet | DO NOT USE | react-leaflet v5 requires React 19 (breaking). react-leaflet v4 is on React 18 but lacks WebGL — cannot render thousands of route points performantly. Canvas/SVG rendering is insufficient for smooth animated flight paths. |
| Mapbox GL JS | DO NOT USE | Proprietary, usage-based pricing, vendor lock-in. MapLibre is its open-source fork with identical API surface. |
| Highcharts Maps | DO NOT USE | Not designed for geographic flight path visualization with satellite tiles. Highcharts Maps is optimized for choropleth/data maps, not interactive tile-based flight routes. Would require Highcharts Maps license. |
| Google Maps | DO NOT USE | Proprietary, expensive at scale, no data-driven line styling equivalent. |
- Load flight path coordinates as a GeoJSON `LineString` feature collection
- Split into segments by connectivity state (Disconnected/Acquiring/Connected)
- Use MapLibre `addLayer` with a `line` layer type and `line-color` driven by a feature property (the RAG status)
- Animate playback by filtering visible segments using the current scrubber timestamp
### State Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | 5.0.12 | Global and view-specific state | Ecosystem constraint — PROJECT.md mandates Zustand. Pattern: `useBearStore` for global state, `createViewStore()` for view-specific state. No Redux, no React Context. |
### Data Fetching
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TanStack React Query | 5.100.x (latest: 5.100.9) | Server state, caching, background refetch | Ecosystem constraint — PROJECT.md mandates React Query via the `useFetch` hook pattern. No raw `fetch`, no axios. |
- Each default chart fetches its own metric data independently (separate `useQuery` calls) — allows incremental loading and independent error handling
- Custom charts in the chart builder use dynamic query keys: `['tail-metric', tailId, metricKey, dateRange]`
- Date range changes invalidate all chart queries simultaneously via shared query key prefix
- 80+ metrics available — do NOT prefetch all. Fetch on demand when user adds a custom chart.
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@viasat/insights-components` | (platform version) | Shared UI: grids, menus, notifications | Use for all shared UI elements. Do not rebuild date pickers, notification toasts, or nav menus from scratch. |
| `@viasat/insights-spa-package` | (platform version) | SPA patterns, routing conventions | Follow existing Insights micro-frontend conventions. |
| `date-fns` or `dayjs` | Current | Date formatting, range math | For date range calculations and display. Do NOT use Moment.js (deprecated, large bundle). Prefer `date-fns` if already in the platform. |
| `colors.ts` (internal) | — | Color constants | Do not hardcode hex values. Import RAG colors, theme tokens from the platform `colors.ts`. |
## What NOT to Use
| Category | Do Not Use | Why Not |
|----------|-----------|---------|
| Charting | `highcharts-react-official` | Deprecated in favor of `@highcharts/react`. Do not use both packages simultaneously. |
| Charting | Highcharts Gantt product | Requires separate license. Use x-range series instead for event timeline. |
| Charting | D3, Recharts, Chart.js, Victory, ECharts | Not in the Insights ecosystem. Introducing a second charting library creates dual dependency, inconsistent theming, and maintenance burden. |
| Map | react-leaflet v5 | Requires React 19, incompatible with the platform's React 18. |
| Map | Mapbox GL JS | Proprietary + usage-based pricing. Use MapLibre (identical API, open source). |
| Map | Highcharts Maps | Wrong tool — optimized for choropleth, not tile-based interactive flight routes. Also requires additional license. |
| State | Redux | PROJECT.md explicitly prohibits Redux. Zustand only. |
| State | React Context | PROJECT.md explicitly prohibits React Context for state. Zustand only. |
| Styling | CSS modules | PROJECT.md prohibits CSS modules. Emotion `styled()` only. |
| Styling | Tailwind CSS | Not in the Insights ecosystem. Would conflict with MUI theming approach. |
| Data | raw `fetch`, axios | PROJECT.md mandates React Query `useFetch` hook pattern exclusively. |
| Date handling | Moment.js | Deprecated, 67KB bundle, no tree-shaking. Use `date-fns` or `dayjs`. |
| MUI | MUI v7/v8/v9 | Platform is pinned to MUI v6. Upgrading would break `@viasat/insights-components` compatibility. |
## Installation
# Core charting (new official wrapper — requires Highcharts >=12)
# Map stack (MapLibre endpoint — no token required)
# State management (if not already installed by platform)
# Data fetching (if not already installed by platform)
# Emotion (likely already installed via MUI v6)
## Confidence Assessment
| Area | Confidence | Source | Notes |
|------|------------|--------|-------|
| `@highcharts/react` v4.2.1 as official wrapper | HIGH | github.com/highcharts/highcharts-react package.json (live) | Confirmed this replaces `highcharts-react-official`. Requires Highcharts >=12.0.0, React >=18. |
| Highcharts v12.6.0 as current version | HIGH | changelog.highcharts.com (live) | v12 released Nov 2024; v12.6.0 current as of Apr 2026. |
| Synchronized zoom via `chart.events.selection` + `setExtremes` | HIGH | api.highcharts.com + Highcharts demo pattern (live) | First-party pattern, not a workaround. |
| X-range series as Gantt alternative | HIGH | highcharts.com docs (live) | "X-range is the basic series of a Gantt chart." Requires only `modules/xrange.js`, not a Gantt license. |
| Highcharts Gantt is a separate licensed product | HIGH | shop.highcharts.com/license (live) | Must be explicitly purchased. Not bundled with core license. |
| MapLibre GL JS v5.24.0 as recommended map engine | HIGH | maplibre.org/docs (live) | Open source, free, active maintenance, identical API to Mapbox GL JS. |
| `react-map-gl` v8.1.1 with MapLibre endpoint | HIGH | github.com/visgl/react-map-gl releases (live) | Confirmed supports `maplibre-gl>=4` via `react-map-gl/maplibre` import. |
| react-leaflet v5 requires React 19 | HIGH | github.com/PaulLeCam/react-leaflet releases (live) | Breaking change — incompatible with platform React 18. |
| TanStack React Query v5.100.9 | HIGH | github.com/TanStack/query releases (live) | Stable, actively maintained, ecosystem standard. |
| Zustand v5.0.12 | HIGH | github.com/pmndrs/zustand releases (live) | Current stable version. |
| MUI v6 as platform version | HIGH | PROJECT.md (authoritative) | Explicitly mandated. MUI v9 is current upstream but do not upgrade. |
| MUI v9 as upstream current | HIGH | mui.com/material-ui installation docs (live) | Confirmed v9 is current, supports React 17/18/19. |
| MapTiler free tier for satellite tiles | MEDIUM | maptiler.com/maps (live) | Free tier confirmed, satellite hybrid style confirmed. Pricing/rate limits not verified — validate before production use. |
## Sources
- `@highcharts/react` package.json: https://github.com/highcharts/highcharts-react/blob/master/package.json
- Highcharts changelog (live): https://changelog.highcharts.com/
- Highcharts React getting started: https://www.highcharts.com/docs/react/getting-started
- Highcharts React Chart component API: https://www.highcharts.com/docs/react/components/chart
- Highcharts `chart.events.selection` API: https://api.highcharts.com/highcharts/chart.events.selection
- Highcharts x-range series: https://www.highcharts.com/docs/chart-and-series-types/x-range-series
- Highcharts license structure: https://shop.highcharts.com/license
- react-map-gl releases: https://github.com/visgl/react-map-gl/releases
- MapLibre GL JS docs: https://maplibre.org/maplibre-gl-js/docs/
- react-leaflet releases (React 19 requirement): https://github.com/PaulLeCam/react-leaflet/releases
- TanStack Query releases: https://github.com/TanStack/query/releases
- Zustand releases: https://github.com/pmndrs/zustand/releases
- MUI v9 installation: https://mui.com/material-ui/getting-started/installation/
- MapTiler map styles: https://maptiler.com/maps/
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
