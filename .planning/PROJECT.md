# Tail History View — Insights

## What This Is

A new standalone frontend view for the Insights aviation analytics platform (insights.viasat.com) that allows users to review the connectivity and network history for a specific aircraft tail. It shows recent flight paths on an interactive map with RAG-colored connectivity status, a rich set of default charts covering connectivity metrics, and a user-configurable custom chart builder for deep-dive analysis.

## Core Value

Aviation customers must be able to build and zoom custom connectivity charts across any time window — this is the primary analytical workflow that differentiates the Tail History view from existing tools.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Map & Navigation**
- [ ] Flight path map displays aircraft routes with RAG-colored connectivity status segments
- [ ] Default lookback of 14 days; user can select custom date range via date-range picker
- [ ] Map shows satellite & beam, disconnected, network acquired, and network organization overlays

**Playback / Timeline**
- [ ] Scrubable playback timeline allows user to play back or manually scrub through connectivity state over time
- [ ] Playback speed control (slow / normal / fast)
- [ ] Discrete slider markers that snap to flight events or day boundaries for easier navigation

**Custom Chart Builder (v1 Priority)**
- [ ] User can select from the full list of available metrics and plot them as custom charts over time
- [ ] Supported chart formats: line, bar, area, scatter (as applicable per metric)
- [ ] Custom charts persist within the session and can be removed/re-ordered

**Chart Zoom — Synchronized (v1 Priority)**
- [ ] User can drag-select a time range on any chart to zoom in
- [ ] All other charts (default and custom) synchronize to the same zoomed time range
- [ ] Playback slider updates to reflect the zoomed time range
- [ ] Zoom uses HighCharts draggable zooming (`chart.zooming` with draggable option)

**Default Charts**
- [ ] Events Timeline (gantt-style: Disconnected, Acquiring, Connected, Network Change, Timing Events)
- [ ] iQe Score (Download Performance, Upload Performance, Network Availability, Signal Strength, Beam Transition, Transmission Resilience, Month-to-date WPS)
- [ ] Service Availability & CIR Satisfaction
- [ ] CIR Fulfillment
- [ ] Traffic Composition
- [ ] Latency & Packet Loss
- [ ] Download Usage / Upload Usage / Cumulative Usage
- [ ] Beam Download / Beam Upload
- [ ] Antenna Pointing (Forward/Return Link Quality)

**Custom Chart Metric Library**
- [ ] Full metric list available for custom chart creation (80+ metrics covering CIR/MIR, CN0, SNR, latency, bytes, QoS, modem stats, link quality, SBB usage, iQe components, etc.)

### Out of Scope

- Backend API development — APIs for tail history data already exist; this is a frontend-only project
- User authentication / login — handled by the parent Insights platform
- Real-time / live tracking — this is a historical view only (no live WebSocket feeds)
- Mobile-native app — responsive web only

## Context

- **Platform**: insights.viasat.com — Viasat's aviation connectivity analytics suite. The Tail History view is a new net-new page within the platform (no existing Tail Details page to extend).
- **Ecosystem**: The Insights platform uses `@viasat/insights-spa-package` and `@viasat/insights-components`. New views are expected to follow the same patterns as `insights-manager` (Zustand, React Query, Emotion/MUI styled, etc.).
- **Design source**: Figma — "Tail Details - History (JetWave X, DATA-399, DATA-335)" — early concepts available at node-id 310-148332 (full view) and 530-51991 (chart examples).
- **Charts**: HighCharts is the established charting library. Synchronized zoom between charts is a core interaction requirement.
- **Custom chart builder**: The most differentiating feature. Users choose from 80+ metrics and chart types to build their own analysis views.
- **MUI Discrete Slider**: The playback scrubber should behave like MUI's discrete slider — snapping to flight markers and day boundaries.
- **API status**: Backend data endpoints already exist. No API documentation available yet — backend team will need to be consulted for endpoint contracts.

## Constraints

- **Tech Stack**: React + TypeScript + MUI v6 + HighCharts — must remain consistent with the Insights ecosystem
- **Component Library**: Use `@viasat/insights-components` for shared UI (grids, menus, notifications, etc.)
- **Copyright**: Every source file must include the Viasat copyright header (© 2026 Viasat, Inc.)
- **State Management**: Zustand for global state (`useBearStore`), `createViewStore()` for view-specific state — no Redux or React Context
- **Data Fetching**: TanStack React Query via `useFetch` hook pattern — no raw `fetch` or `axios`
- **Styling**: Emotion `styled()` or MUI `styled()` — no CSS modules, no hardcoded hex colors (import from `colors.ts`)
- **No hard deadline** — planning phase, no committed ship date yet

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Custom charts + zoom as v1 priority | Most differentiating analytical capability; Travis confirmed this is the focus | — Pending |
| Frontend-only project | Backend APIs already exist — scope is constrained to UI work | — Pending |
| New standalone project | Not added to insights-manager (admin console); will be a separate deployable or micro-frontend integrated into the Insights platform | — Pending |
| HighCharts synchronized zoom | Existing charting library; `chart.zooming` draggable option directly supports drag-to-zoom requirement | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-04 after initialization*
