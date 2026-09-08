---
phase: 3
slug: default-charts
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 |
| **Config file** | `tail-history/vite.config.ts` (embedded `test:` block) |
| **Quick run command** | `cd tail-history && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd tail-history && npx vitest run` |
| **Estimated runtime** | ~60 seconds (8 test files + 40 existing tests) |

---

## Sampling Rate

- **After every task commit:** Run `cd tail-history && npx vitest run --reporter=verbose src/__tests__/<chart>.test.tsx`
- **After every plan wave:** Run `cd tail-history && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Req | Wave | Behavior | Test Type | Automated Command | File Exists |
|---------|-----|------|----------|-----------|-------------------|-------------|
| 03-W0-01 | CHART-01 | 0 | EventsTimeline renders with xrange series, loading skeleton, empty state | unit | `npx vitest run --reporter=verbose src/__tests__/EventsTimeline.test.tsx` | ❌ W0 |
| 03-W0-02 | CHART-02 | 0 | IqeScoreChart renders title, loading skeleton, empty state | unit | `npx vitest run --reporter=verbose src/__tests__/IqeScore.test.tsx` | ❌ W0 |
| 03-W0-03 | CHART-03 | 0 | ServiceAvailabilityChart renders title, loading/empty states | unit | `npx vitest run --reporter=verbose src/__tests__/ServiceAvailability.test.tsx` | ❌ W0 |
| 03-W0-04 | CHART-04 | 0 | CirFulfillmentChart renders title, loading/empty states | unit | `npx vitest run --reporter=verbose src/__tests__/CirFulfillment.test.tsx` | ❌ W0 |
| 03-W0-05 | CHART-05 | 0 | TrafficCompositionChart renders with stacked area series | unit | `npx vitest run --reporter=verbose src/__tests__/TrafficComposition.test.tsx` | ❌ W0 |
| 03-W0-06 | CHART-06 | 0 | LatencyPacketLossChart renders title with 4 series, loading/empty states | unit | `npx vitest run --reporter=verbose src/__tests__/LatencyPacketLoss.test.tsx` | ❌ W0 |
| 03-W0-07 | CHART-07 | 0 | UsageChart renders with 3 series (Download/Upload/Cumulative) | unit | `npx vitest run --reporter=verbose src/__tests__/UsageChart.test.tsx` | ❌ W0 |
| 03-W0-08 | CHART-08 | 0 | BeamAntennaChart renders 3 strips with correct titles | unit | `npx vitest run --reporter=verbose src/__tests__/BeamAntenna.test.tsx` | ❌ W0 |
| 03-W0-09 | CHART-01..08 | 0 | All 8 chart components render in TailHistoryPage | unit | `npx vitest run --reporter=verbose src/__tests__/TailHistoryPage.test.tsx` | ✅ update needed |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tail-history/src/__tests__/EventsTimeline.test.tsx` — stubs for CHART-01 (xrange, loading, empty)
- [ ] `tail-history/src/__tests__/IqeScore.test.tsx` — stubs for CHART-02
- [ ] `tail-history/src/__tests__/ServiceAvailability.test.tsx` — stubs for CHART-03
- [ ] `tail-history/src/__tests__/CirFulfillment.test.tsx` — stubs for CHART-04
- [ ] `tail-history/src/__tests__/TrafficComposition.test.tsx` — stubs for CHART-05
- [ ] `tail-history/src/__tests__/LatencyPacketLoss.test.tsx` — stubs for CHART-06
- [ ] `tail-history/src/__tests__/UsageChart.test.tsx` — stubs for CHART-07
- [ ] `tail-history/src/__tests__/BeamAntenna.test.tsx` — stubs for CHART-08
- [ ] `tail-history/src/__tests__/TailHistoryPage.test.tsx` — update existing test: verify all 8 chart components mount

Vitest 4.1.5 is already installed; 40 existing tests pass. No framework install needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Zoom sync: all 8 charts zoom together | CHART-01..08 | Requires browser — Highcharts zoom events can't be triggered in jsdom | Dev server → select range on one chart → confirm all others update |
| Loading skeleton appears at correct chart height | D-04 | Visual layout verification — requires browser render | Dev server → observe skeleton matches chart strip height before data loads |
| Empty state message centered in strip | D-05 | Visual centering — requires browser render | Dev server → use tail with no data → confirm "No data available" is centered |
| CHART-08 strip count/ordering matches Figma | CHART-08 | Figma MCP not accessible; strip breakdown is inferred | Open Figma node 530-51991 → compare strip titles and ordering with rendered page |
| Events Timeline gantt bars render with correct RAG colors | CHART-01 | xrange color-per-point rendering requires WebGL/canvas | Dev server → Events Timeline shows green/amber/red bars per connectivity state |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
