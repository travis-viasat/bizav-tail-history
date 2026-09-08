# Tail History View — BizAv Insights

A standalone frontend view for the Insights aviation analytics platform (insights.viasat.com) that lets users review the connectivity and network history for a specific aircraft tail.

## Purpose

Aviation customers, Technical Account Managers, and support teams need to investigate connectivity issues on a per-tail basis across time. This view provides an interactive flight map with RAG-colored connectivity status, a rich set of default connectivity metric charts, and a user-configurable custom chart builder for deep-dive analysis.

**Core value:** Users can build and zoom custom connectivity charts across any time window — this is the primary analytical workflow that differentiates Tail History from existing Insights tools.

## Features

- Interactive flight path map with RAG-colored connectivity segments (MapLibre GL)
- Default charts covering key connectivity metrics (SNR, CNO, throughput, etc.)
- Custom chart builder supporting 80+ available metrics
- Synchronized zoom across all charts
- Network switch annotations (Ka ↔ GX) overlaid on timeline charts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| UI Components | MUI v6 + Emotion styled() |
| Charting | Highcharts 12 + @highcharts/react |
| Map | MapLibre GL JS + react-map-gl |
| State | Zustand |
| Data Fetching | TanStack React Query v5 |
| Build | Vite |

## Design Decisions

- **MapLibre over Mapbox** — Open-source, free, identical API surface; no usage-based pricing
- **X-range series over Highcharts Gantt** — X-range is included in the core Highcharts license; Gantt requires a separate paid license
- **Zustand over Redux/Context** — Mandated by the Insights platform; `useBearStore` for global state, `createViewStore()` for view-specific state
- **React Query via `useFetch`** — Platform convention; metrics are fetched on demand (not prefetched) to avoid loading all 80+ metrics upfront
- **MUI v6 pinned** — Platform constraint; upgrading to v7+ would break `@viasat/insights-components` compatibility
- **Emotion `styled()` only** — No CSS modules, no hardcoded hex colors; all color values imported from `colors.ts`

## Live Prototype

[https://pages.git.viasat.com/tyunis/bizav-tail-history/](https://pages.git.viasat.com/tyunis/bizav-tail-history/)

## Development

```sh
npm install
npm run dev
```

## Related Prototypes

| Prototype | Link |
|-----------|------|
| Open Cases | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-open-cases-prototype/) |
| JX SNR & CNO Mockup | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-jx-snr-cno-mockup/) |
| Aircraft Status Side Sheet | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-aircraft-status-side-sheet/) |
| Flight List GPS Flag | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-flight-list-gps-flag/) |
| GPS Interference | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-gps-interference/) |
| Flight Log | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-flight-log/) |
| Concierge Flight Analysis | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-concierge-flight-analysis/) |
| Antenna Pointing Mockup | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-antenna-pointing-mockup/) |
| COMAV Events Timeline (Insights) | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/comav-events-timeline-insights/) |
| COMAV Events Timeline | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/comav-events-timeline/) |
| COMAV GX IP Addresses | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/comav-gx-ip-addresses/) |
| Data Apps Health Dashboard | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/bizav-data-apps-health-dashboard/) |
| COMAV Column Groups | [pages.git.viasat.com](https://pages.git.viasat.com/tyunis/comav-column-groups/) |
