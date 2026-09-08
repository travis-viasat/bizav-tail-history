---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `vite.config.ts` (vitest config embedded) or `vitest.config.ts` — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| App smoke | 01 | 1 | FOUND-01 | smoke | `npx vitest run src/__tests__/App.test.tsx` | ❌ W0 | ⬜ pending |
| Highcharts config | 01 | 1 | FOUND-02 | unit | `npx vitest run src/__tests__/highchartsConfig.test.ts` | ❌ W0 | ⬜ pending |
| Zustand store | 01 | 1 | FOUND-03 | unit | `npx vitest run src/__tests__/tailHistoryStore.test.ts` | ❌ W0 | ⬜ pending |
| Date range picker | 01 | 1 | FOUND-04 | integration | `npx vitest run src/__tests__/PageHeader.test.tsx` | ❌ W0 | ⬜ pending |
| Chart registry | 01 | 1 | FOUND-05 | unit | `npx vitest run src/__tests__/TailHistoryPage.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/App.test.tsx` — smoke test: app renders at `/tail-history/N12345` (FOUND-01)
- [ ] `src/__tests__/highchartsConfig.test.ts` — unit: `Highcharts.getOptions()` returns `useUTC: true` and `turboThreshold: 0` (FOUND-02)
- [ ] `src/__tests__/tailHistoryStore.test.ts` — unit: store slices initialize correctly, `setTimeRange` updates only `timeRange` (FOUND-03)
- [ ] `src/__tests__/PageHeader.test.tsx` — integration: date range defaults to last 14 days, applying new range calls `queryClient.invalidateQueries` (FOUND-04)
- [ ] `src/__tests__/TailHistoryPage.test.tsx` — unit: `registerChart`/`unregisterChart` callbacks modify `chartRegistryRef.current` (FOUND-05)
- [ ] `src/setupTests.ts` — shared config: mock `window.localStorage`, mock `@viasat/insights-components`
- [ ] Framework install: `npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Page loads in browser at `/tail-history/:tailId` URL | FOUND-01 | Browser rendering / routing cannot be fully asserted in jsdom | Run `npm run dev`, navigate to `/tail-history/N12345`, confirm tail ID appears in header |
| Date range picker shows last 14 days on first load | FOUND-04 | Visual default state | Open app fresh, confirm picker shows today minus 14 days without any interaction |
| Changing date range triggers network refetch | FOUND-04 | Requires real network / devtools | Open browser devtools Network tab, change date range, confirm new requests fire |
| HighCharts devtools inspector shows turboThreshold: 0 | FOUND-02 | Runtime Highcharts.getOptions() inspection | Open console, run `Highcharts.getOptions().plotOptions.series.turboThreshold`, confirm `0` |
| Zustand store visible in Redux DevTools | FOUND-03 | Browser extension required | Open Redux DevTools extension, confirm `timeRange`, `zoomedRange`, `playhead` slices appear |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
