# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## ip-history-chart-styling-and-zoom — IP History chart missing card styling and zoom sync
- **Date:** 2026-05-15
- **Error patterns:** missing card, white background, border, border-radius, StripContainer, zoom, setExtremes, sync, IpHistoryChart, ChartStrip, MuiPaper, divider
- **Root cause:** IpHistory.tsx wrapped IpHistoryChart in a bare Box with no card styling. The vendor's ChartContainer (MUI Paper) uses theme.palette.divider ('#125A871F' — nearly invisible) as border vs StripContainer's SURFACE_GREY[200] ('#DEE4E8'), plus mismatched border-radius (8px vs 4px) and padding. Zoom logic (trigger:'zoom') was already correctly wired — the apparent zoom bug was the visual mismatch making the chart hard to see/interact with.
- **Fix:** Added StripContainer styled component to IpHistory.tsx mirroring ChartStrip's StripContainer exactly (WHITE bg, 1px SURFACE_GREY[200] border, 4px border-radius, 8px/16px padding, 16px marginBottom), with '& .MuiPaper-root' CSS override to reset the vendor's inner Paper so the two card layers don't double-stack.
- **Files changed:** src/pages/tailHistory/charts/IpHistory/IpHistory.tsx
---
