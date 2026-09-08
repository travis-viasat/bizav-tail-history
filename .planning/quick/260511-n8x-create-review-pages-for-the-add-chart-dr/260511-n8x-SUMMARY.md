---
phase: quick
plan: 260511-n8x
status: complete
completed: 2026-05-11
commits:
  - 08f63f5 feat(260511-n8x): add 4-state review gallery for Add Chart drawer
  - acdf1e3 fix(review): pass _reviewTailId="demo" so review routes bypass the no-tail guard
---

## Outcome

Created a 4-state stakeholder review gallery for the Add Chart drawer, accessible at `/review` and `/review/:stateId`.

## What Was Built

- `src/pages/review/reviewStates.ts` — State config for 4 review scenarios (empty, partial-all-types, constrained-types, max-metrics)
- `src/pages/review/ReviewBanner.tsx` — Fixed banner (z-index 1300) with state name, description, and prev/next navigation
- `src/pages/review/ReviewIndexPage.tsx` — Index at `/review` listing all 4 states as cards
- `src/pages/review/ReviewStatePage.tsx` — Wrapper that resolves metrics and renders TailHistoryPage with drawer pre-opened
- `src/pages/review/DrawerReviewPage.tsx` — Additional review page at `/review/drawer`
- `src/pages/tailHistory/TailHistoryPage.tsx` — Added `_reviewDrawerOpen` and `_reviewInitialMetrics` props
- `src/components/AddChartDrawer/AddChartDrawer.tsx` — Added `_reviewInitialMetrics` prop for pre-selection
- `src/App.tsx` — Added `/review`, `/review/drawer`, `/review/:stateId` routes

## Key Decisions

- Used `_review` prefix convention to clearly mark all review-only props as non-production
- Fixed banner at z-index 1300 (above MUI Drawer's 1200) so it stays visible when drawer is open
- Static `/review/drawer` route declared before dynamic `/review/:stateId` to prevent parameter capture
- `_reviewTailId="demo"` passed to bypass the no-tail guard in TailHistoryPage

## Verification

- TypeScript compiles without errors
- All 4 review states render full TailHistoryPage with drawer pre-opened in correct configuration
- Normal `/tail-history/:tailId` route behavior unchanged
