# Phase 3: Default Charts - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 03-default-charts
**Areas discussed:** API contract approach, Chart groupings (CHART-07 & CHART-08), Loading & empty states, Events Timeline RAG colors

---

## API Contract Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Mock stubs first | Build all 8 charts against typed mock data. Each chart defines a TypeScript interface + mock hook. Swap to real useFetch calls once backend confirms endpoint shapes. No blocker, fastest to execute. | ✓ |
| Real calls with placeholder URLs | Wire real useFetch calls with best-guess endpoint paths. Charts show loading/error until backend confirms URLs and response shapes. | |
| Block on backend first | Pause Phase 3 until backend provides documented endpoint contracts, then build against real APIs from day one. | |

**User's choice:** Mock stubs first
**Notes:** Backend APIs exist but endpoint contracts are not documented. Phase 3 proceeds with typed mock data; real API swap happens in a future task once contracts arrive.

---

## Chart Groupings (CHART-07)

| Option | Description | Selected |
|--------|-------------|----------|
| 3 separate chart strips | Download Usage, Upload Usage, Cumulative Usage each get their own ChartStrip. | |
| 1 combined chart, 3 series | Single strip with all 3 as separate colored lines — easier to compare. | ✓ |

**User's choice:** 1 combined chart, 3 series
**Notes:** Download, Upload, and Cumulative Usage all in one ChartStrip.

---

## Chart Groupings (CHART-08)

| Option | Description | Selected |
|--------|-------------|----------|
| All 5 separate strips | Beam Download, Beam Upload, Forward Link Quality, Return Link Quality, Antenna Pointing — each its own chart. | |
| Beam group + Antenna group | Two strips: Beam metrics together, Antenna/Link Quality together. | |
| Match the Figma order | Use whatever ordering and grouping is shown in the Figma design for this section. | ✓ |

**User's choice:** Match the Figma order (separate charts)
**Notes:** User confirmed these are separate charts; exact count and ordering deferred to Figma node 530-51991. Researcher must read the Figma before planning.

---

## Loading States

| Option | Description | Selected |
|--------|-------------|----------|
| MUI Skeleton | Animated skeleton block at chart strip height. Layout-stable, integrated look. | ✓ |
| Circular spinner centered | MUI CircularProgress inside chart area. Simpler but causes layout shift. | |
| Greyed-out strip with spinner | ChartStrip card renders; chart area shows centred spinner on grey background. | |

**User's choice:** MUI Skeleton
**Notes:** Skeleton at same height as chart strip to prevent layout shift.

---

## Empty States

| Option | Description | Selected |
|--------|-------------|----------|
| Inline message inside the strip | "No data available for this period" centered inside the chart strip. | ✓ |
| Hide the chart entirely | Strip doesn't render when no data — page shrinks. | |
| Same as error state | Treat no-data as a generic error message. | |

**User's choice:** Inline message inside the strip
**Notes:** Chart strip remains visible and maintains its height; text message informs user of no data.

---

## Events Timeline RAG Colors

| Option | Description | Selected |
|--------|-------------|----------|
| Use standard colors for now | Standard green/amber/red from MUI palette. Swap to Figma values before browser verify. | ✓ |
| I can provide the Figma values now | User would share hex codes to lock into colors.ts immediately. | |
| Check Figma design file | Researcher pulls exact colors from Figma node 530-51991. | |

**User's choice:** Use standard colors for now
**Notes:** RAG_CONNECTED, RAG_ACQUIRING, RAG_DISCONNECTED in colors.ts remain placeholders until Phase 3 browser verification, at which point exact Figma hex values are applied.

---

## Claude's Discretion

- Error state treatment (failed fetch)
- ChartStrip wrapper pattern for data-fetching charts
- Chart ordering on page (top to bottom) — follow Figma
- Zoom sync wiring pattern (reuse Phase 2 approach)

## Deferred Ideas

None raised during discussion.
