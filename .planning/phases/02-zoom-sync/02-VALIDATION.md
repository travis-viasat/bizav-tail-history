---
phase: 2
slug: zoom-sync
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 + @testing-library/react 16.3.2 |
| **Config file** | `tail-history/vite.config.ts` (vitest config embedded) |
| **Quick run command** | `npx vitest run --reporter=verbose` (from `tail-history/`) |
| **Full suite command** | `npx vitest run --coverage` (from `tail-history/`) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | ZOOM-02 | unit | `npx vitest run src/__tests__/useChartSync.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 0 | ZOOM-03, ZOOM-04 | unit | `npx vitest run src/__tests__/ZoomControls.test.tsx` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 0 | ZOOM-01 | unit | `npx vitest run src/__tests__/ChartStrip.test.tsx` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 1 | ZOOM-02 | unit | `npx vitest run src/__tests__/useChartSync.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-05 | 01 | 1 | ZOOM-01, ZOOM-03, ZOOM-04 | unit | `npx vitest run src/__tests__/ChartStrip.test.tsx src/__tests__/ZoomControls.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/useChartSync.test.ts` — stubs for ZOOM-02 (feedback loop guard — most critical test in phase)
- [ ] `src/__tests__/ZoomControls.test.tsx` — stubs for ZOOM-03 (slider range update) + ZOOM-04 (reset zoom)
- [ ] `src/__tests__/ChartStrip.test.tsx` — stubs for ZOOM-01 (zoom enabled, chart renders, registration)
- [ ] `src/hooks/useChartSync.ts` — implementation (tests cannot pass without it)
- [ ] `src/components/ChartStrip/ChartStrip.tsx` — component (tests cannot pass without it)
- [ ] `src/pages/tailHistory/ZoomControls.tsx` — component (tests cannot pass without it)

*Existing infrastructure covers test framework — Vitest, @testing-library/react, and jsdom are already installed and configured from Phase 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-select zoom on a chart visually rubber-bands and snaps to the selected range | ZOOM-01 | Requires browser drag interaction; jsdom cannot simulate mouse drag on canvas/SVG Highcharts elements | Open `http://localhost:5173/tail-history/N12345`. Drag across a region of the Latency chart. Verify the chart zooms to the selected time region. |
| Second chart snaps to same zoom range simultaneously (no lag, no loop) | ZOOM-02 | Requires two live Highcharts instances in a real browser | After zooming the Latency chart, verify Packet Loss chart instantly reflects the same x-axis range. Check browser CPU — must not spike to 100%. |
| Slider narrows to reflect zoom window | ZOOM-03 | Requires visual inspection of MUI Slider thumb positions | After zooming, verify the slider thumb positions narrow to match the zoomed range. |
| Reset Zoom restores all charts | ZOOM-04 | Requires visual verification across all charts | After zooming, click Reset Zoom. Verify both charts return to the full 14-day range and the slider returns to full width. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
