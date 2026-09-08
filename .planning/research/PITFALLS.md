# Domain Pitfalls

**Domain:** HighCharts React analytics dashboard — synchronized zoom, dynamic chart builder, animated playback timeline
**Project:** Tail History View — Insights (insights.viasat.com)
**Researched:** 2026-05-04
**Overall confidence:** HIGH for HighCharts-specific pitfalls (verified against official docs and demos); MEDIUM for React/Zustand interaction patterns (official docs verified, no project-specific benchmarks)

---

## Critical Pitfalls

Mistakes that cause rewrites, data corruption, or deeply broken UX.

---

### Pitfall 1: The setExtremes Feedback Loop (Synchronized Zoom)

**What goes wrong:** You wire up synchronized zoom by listening to `afterSetExtremes` on each chart's xAxis and calling `setExtremes()` on all other charts. Chart A zooms, triggers B and C to zoom, which each re-trigger the event, which calls back into A, creating an infinite cascade that freezes the browser.

**Why it happens:** `afterSetExtremes` fires for every programmatic `setExtremes()` call, not just user-initiated ones. Without a guard, every chart in the sync group becomes both a producer and a consumer of the same event.

**Consequences:** Browser tab hang, unresponsive UI, potential memory spike from infinite call stack. This is the most reported HighCharts synchronization bug.

**Prevention:** Use the `trigger` property in the options argument of `setExtremes()`. Pass `{ trigger: 'syncExtremes' }` as the fifth argument when calling programmatically. In the `afterSetExtremes` handler, check `if (e.trigger !== 'syncExtremes')` before re-broadcasting. This is the pattern used in HighCharts' own synchronized-charts official demo.

```typescript
// In xAxis.events.afterSetExtremes:
afterSetExtremes(e: Highcharts.AxisSetExtremesEventObject) {
  if (e.trigger !== 'syncExtremes') {
    Highcharts.charts.forEach((chart) => {
      if (chart && chart !== this.chart) {
        chart.xAxis[0].setExtremes(e.min, e.max, true, false, {
          trigger: 'syncExtremes',
        });
      }
    });
  }
}
```

**Warning signs:** Any zoom action causes visible "snapping" or repeated re-renders. Chrome DevTools shows a deep call stack in a synchronization handler. UI becomes unresponsive after first zoom.

**Phase:** Must be addressed in the phase that introduces chart zoom. Do not defer as a "refine later" item — infinite loops in synchronization are not incrementally fixable.

---

### Pitfall 2: HighCharts Instance Leak via Highcharts.charts Array

**What goes wrong:** HighCharts maintains a global `Highcharts.charts` array containing every chart instance ever created. When a React component unmounts without calling `chart.destroy()`, the instance remains in this array indefinitely. In the custom chart builder, users add and remove charts repeatedly. Each removed chart leaves a ghost instance. The sync loop above iterates `Highcharts.charts` and finds these destroyed-but-not-cleaned-up instances, calling `.setExtremes()` on null/stale objects, causing crashes.

**Why it happens:** `highcharts-react-official` does call `chart.destroy()` automatically on unmount — but only if the chart was created by the wrapper's internal lifecycle. If you access the chart imperatively (via `ref.current.chart`) and then store that reference elsewhere, the instance may outlive the component.

**Consequences:** Memory grows with every chart add/remove cycle. The sync loop must null-check every entry in `Highcharts.charts`. Stale event listeners fire on unmounted components.

**Prevention:**
1. Always use the `ref` prop from `highcharts-react-official` to access instances — never `new Highcharts.Chart()` directly in React components.
2. In the sync loop, always guard: `Highcharts.charts.forEach((chart) => { if (chart && chart.xAxis?.[0]) { ... } })`.
3. If you store chart refs in Zustand or a ref array for the custom builder, explicitly null out entries when a chart unmounts using a cleanup callback.

**Warning signs:** `Highcharts.charts.length` grows each time a user adds/removes a custom chart. Console errors about "Cannot read property 'setExtremes' of undefined." Memory profile shows chart-related objects accumulating.

**Phase:** Address in the phase building the custom chart builder. The default charts (fixed set) have low risk. The dynamic builder is where this compounds.

---

### Pitfall 3: New Options Object on Every React Render (Re-render Storm)

**What goes wrong:** You pass chart configuration as an inline object literal to `<HighchartsReact options={getOptions(data)} />`. Every parent re-render creates a new object reference, triggering `highcharts-react-official` to call `chart.update()` on every render — even when nothing about the chart actually changed. With 10+ charts on screen, a single Zustand state change (e.g., playback position) causes 10+ chart updates simultaneously.

**Why it happens:** `highcharts-react-official` uses reference equality to decide whether to update. A new object reference — even with identical contents — triggers an update cycle. This is worsened by `allowChartUpdate` defaulting to `true`.

**Consequences:** Visible chart flicker on every state change. Playback animation stutters because chart updates compete with animation frame callbacks. CPU spikes visible in DevTools Performance panel.

**Prevention:**
1. Memoize options objects with `useMemo`, keyed to the actual data dependencies — not the parent component's render cycle.
2. Separate static configuration (axis setup, chart type, colors) from dynamic data (series data). Store static config as module-level constants, not inside components.
3. Set `allowChartUpdate={false}` for charts whose options should only be set at mount time. Use imperative `chart.update()` or `series.setData()` calls for runtime data changes, bypassing React's render cycle entirely for high-frequency updates.
4. For playback crosshair position: use `chart.xAxis[0].drawCrosshair()` imperatively rather than updating the options object.

**Warning signs:** React DevTools Profiler shows all chart components re-rendering when unrelated state changes. HighCharts renders are visible in the Performance flame chart at 60fps even when the chart data hasn't changed.

**Phase:** Establish memoization discipline in the phase that introduces multiple simultaneous charts. Retrofit is painful — set the pattern early.

---

### Pitfall 4: Zustand Subscription Causing Re-renders on High-Frequency State

**What goes wrong:** The playback timeline updates a cursor/time position at animation frame rate (~60fps). If this position is stored in Zustand and components subscribe with `useStore((s) => s.playbackPosition)`, every frame triggers a re-render of every component that subscribes — including all chart containers, the map, and the MUI slider.

**Why it happens:** Zustand re-renders every subscriber whenever selected state changes. At 60fps, this means 60 full React render cycles per second across every subscribing component, regardless of whether those components visually need to update.

**Consequences:** Playback animation is jerky. CPU usage spikes to 100% during playback. Other chart interactions become unresponsive during playback.

**Prevention:**
1. Do not put sub-second animation state (playback cursor position, crosshair millisecond value) into Zustand. Use a `useRef` to hold the current playback position imperatively.
2. Drive HighCharts crosshair updates via direct imperative calls in the rAF loop: `chart.xAxis[0].drawCrosshair(undefined, chart.series[0].data[index])` — not via React state.
3. Only write to Zustand at user-meaningful granularity: when the user scrubs to a position, when playback starts/stops, when the date range changes. Not at every animation frame.
4. For MUI slider display sync, use a separate local `useState` that is written from the rAF loop only when the displayed value needs to change (e.g., when the position crosses a tick boundary), not on every frame.

**Warning signs:** React DevTools shows >30 renders/second on chart container components during playback. CPU usage hits ceiling during playback. Playback animation speed feels inconsistent on different machines.

**Phase:** Address in the playback timeline phase. The rAF loop architecture must be designed upfront — adding imperative chart calls after the fact is manageable, but removing Zustand subscriptions from many components is a larger refactor.

---

### Pitfall 5: requestAnimationFrame Stale Closure Causing Playback to Ignore Stop

**What goes wrong:** The playback rAF loop captures `isPlaying` from React state at the time the effect runs. When the user clicks Stop, `isPlaying` is set to `false` in React state, but the rAF callback still sees the old `true` value and keeps scheduling itself. The animation never stops until the component unmounts.

**Why it happens:** JavaScript closures capture variable references at creation time. The rAF callback is created inside a `useEffect` that only ran once (empty deps array). It holds a stale copy of `isPlaying`.

**Consequences:** Playback cannot be stopped without page refresh. If the user navigates away while playing, the rAF loop continues running, updating HighCharts instances on unmounted components.

**Prevention:**
1. Store `isPlaying` in a `useRef` rather than `useState` for the rAF loop's internal check: `const isPlayingRef = useRef(false)`. Update both the ref and the state when toggling playback.
2. Cancel the rAF on effect cleanup: always return `() => cancelAnimationFrame(frameIdRef.current)` from the effect.
3. Gate the next frame schedule on the ref: `if (isPlayingRef.current) { frameIdRef.current = requestAnimationFrame(animate); }`.

```typescript
const isPlayingRef = useRef(false);
const frameIdRef = useRef<number>(0);

useEffect(() => {
  const animate = (timestamp: number) => {
    if (!isPlayingRef.current) return; // exits cleanly
    advancePlayhead(timestamp);
    frameIdRef.current = requestAnimationFrame(animate);
  };

  if (isPlaying) {
    isPlayingRef.current = true;
    frameIdRef.current = requestAnimationFrame(animate);
  } else {
    isPlayingRef.current = false;
    cancelAnimationFrame(frameIdRef.current);
  }

  return () => {
    isPlayingRef.current = false;
    cancelAnimationFrame(frameIdRef.current);
  };
}, [isPlaying]);
```

**Warning signs:** Clicking Stop has no immediate effect. Console shows animation callback executing after Stop was clicked. Navigating to another page still shows chart crosshair moving.

**Phase:** Address in the playback timeline phase. The useRef guard pattern is a one-time discipline decision — establish it correctly from the first implementation.

---

## Moderate Pitfalls

Mistakes that cause significant rework or persistent bugs, but not full rewrites.

---

### Pitfall 6: Boost Module Breaking Gantt/Event Timeline

**What goes wrong:** The Events Timeline (Gantt-style: Disconnected, Acquiring, Connected states) requires the `ganttChart` constructor and `gantt` series type. The HighCharts Boost module does not support `gantt` series. If Boost is applied globally (`boost.enabled: true` at chart level without series-level guards), the Gantt chart either silently falls back to unoptimized rendering or renders incorrectly.

**Additionally:** Boost disables animation, removes dash-style support, and forces single-pixel rendering for column/bar rectangles — all of which affect the visual quality of the event bars on the timeline.

**Why it happens:** Boost is often added as a catch-all performance fix without checking per-series compatibility. The supported types are: line, column, bar, treemap, heatmap, scatter, bubble, area, areaspline, arearange, columnrange. Gantt is not on this list.

**Consequences:** Event timeline renders as invisible bars or fails silently. Applying `boostThreshold` at the chart level affects series types that don't support it.

**Prevention:**
1. Enable Boost only on specific series that need it: set `boostThreshold: 5000` at the series level, not the chart level.
2. Never use the global `boost.enabled: true` across a mixed dashboard. Each chart type is its own HighCharts instance — configure Boost per-instance.
3. The Events Timeline requires `chartConstructor="ganttChart"` and importing `highcharts/modules/gantt`. Keep this chart isolated from the standard synchronized-zoom group unless you explicitly verify xAxis compatibility.

**Warning signs:** Event timeline shows empty bars after Boost was added. Console warnings about unsupported series type in boost context.

**Phase:** Address in the default charts phase when the Events Timeline is built. Note this explicitly in the Gantt chart implementation task.

---

### Pitfall 7: turboThreshold Silently Truncating Data

**What goes wrong:** HighCharts has a default `turboThreshold` of 1,000 points per series (configurable, but most developers don't know it exists). When a series exceeds this threshold, HighCharts switches to a faster parsing mode that requires a strict data format. If your data uses object arrays (`[{ x: timestamp, y: value, custom: ... }]`) but exceeds the threshold, HighCharts silently drops the data or throws a console error without rendering anything.

**Why it happens:** The threshold exists for performance and was set conservatively. Aviation telemetry at 1-second resolution over 14 days = 1,209,600 points. Even at 1-minute resolution = 20,160 points. Either way, the default is exceeded by many metrics.

**Consequences:** Charts render blank or partially. No obvious visual error — the chart frame appears but the series line is missing. This is one of the hardest bugs to diagnose without knowing what to look for.

**Prevention:**
1. Set `plotOptions.series.turboThreshold: 0` to disable the threshold entirely, or set it to a large value like `1000000` across all chart configurations.
2. Decide on a data format early (either all array-of-arrays `[timestamp, value]` or all object arrays `[{ x, y }]`) and apply it consistently — switching mid-project requires updating every series configuration.
3. For 14-day views at full resolution, always pre-aggregate or decimate data server-side before sending to the client. Do not rely on HighCharts' client-side data grouping for initial load — send appropriately aggregated data, then provide finer data on zoom.

**Warning signs:** Chart renders with no visible series line. No JavaScript error in console. The issue appears/disappears depending on the selected date range (shorter ranges have fewer points and stay under the threshold).

**Phase:** Address in the data integration phase, before the first chart renders real API data. Set `turboThreshold: 0` in the shared chart defaults configuration object.

---

### Pitfall 8: Custom Chart Builder State — Re-mounting vs. Updating

**What goes wrong:** When a user reorders charts (drag-and-drop), changes the metric for an existing chart slot, or toggles a chart's visible series — the wrong React key strategy causes charts to fully re-mount (destroying and recreating the HighCharts instance) instead of updating imperatively. Full re-mounts reset zoom state, re-trigger animations, and create a perceptible flash.

**Conversely:** Reusing the same chart instance across a metric change (no re-mount) requires careful cleanup of old series before adding new ones. Failing to call `series.remove()` before `chart.addSeries()` stacks series data on top of each other.

**Why it happens:** React's `key` prop controls mounting behavior. Using array index as `key` (`charts.map((c, i) => <Chart key={i} />)`) means reordering the array reuses the wrong instance for each position. Using a unique metric ID as `key` means every metric change destroys and recreates.

**Consequences:** Zoom resets unexpectedly when the user reorders charts. Stacked duplicate series lines appear on metric change. Users lose their zoom context mid-analysis.

**Prevention:**
1. Use a stable, user-session-scoped UUID per chart slot as the React `key`. The key represents the slot, not the metric. When the user changes a slot's metric, the instance persists and you update it imperatively via `chart.series[0].remove(); chart.addSeries(newConfig)`.
2. Maintain a Zustand store entry per chart slot: `{ id: uuid, metricId: string, chartType: string, order: number }`. The `id` is the React key, `order` drives visual position.
3. On reorder: update the `order` values in Zustand, use CSS `order` or `flexbox` reordering — do not reorder the DOM array with key changes.

**Warning signs:** Zoom resets when user drags a chart to a new position. Two series lines visible after changing a metric. Brief white flash when the user changes chart type.

**Phase:** Address in the custom chart builder phase. The key strategy is foundational — retrofitting after the builder UI is complete is a significant refactor.

---

### Pitfall 9: DateTime Axis UTC/Local Mismatch for Flight Data

**What goes wrong:** HighCharts defaults to rendering datetime axis labels in the browser's local timezone. Aviation flight data is stored and returned from APIs in UTC. A chart rendered in the US Eastern timezone (UTC-5) will show flight events 5 hours earlier than their actual UTC time, making cross-referencing with the map or external flight logs incorrect.

**Additionally:** If `Highcharts.setOptions({ time: { timezone: 'UTC' } })` is set globally but the user's browser is in a non-UTC timezone, tooltip formatting and axis tick labels can still disagree if any chart uses `time.useUTC: false` locally.

**Why it happens:** HighCharts has two timezone systems: the legacy `useUTC` boolean and the modern `time.timezone` named-timezone string. Mixing them, or setting one globally and overriding the other locally, produces inconsistent results. The browser falls back to UTC offset of 0 if the `time.timezone` value is not recognized by `Intl.DateTimeFormat`.

**Consequences:** Charts show flight events at wrong local times. Playback timeline crosshair position does not align with map route segments. Users in non-UTC timezones see different data than users in UTC.

**Prevention:**
1. Standardize on UTC for all chart rendering in this project. Flight data spans multiple geographic timezones mid-flight — there is no "correct" local timezone for a flight from LAX to JFK.
2. Set globally once at application init: `Highcharts.setOptions({ time: { useUTC: true } })`. Do not set `time.timezone` at all — use raw UTC timestamps throughout.
3. Format all tooltip date/time labels explicitly with `Highcharts.dateFormat()` using UTC-explicit format strings. Do not rely on HighCharts' auto-formatting.
4. Validate by testing the application with the browser clock set to UTC+12 and UTC-12 — charts should show identical axis labels in both cases.

**Warning signs:** QA in the US sees different chart tick labels than QA in Europe. Flight events don't align between the map timeline and the chart crosshair. Timestamp math in tooltip labels is off by hours.

**Phase:** Address in the first phase that renders real flight data. Set `useUTC: true` globally before any chart is initialized. This is extremely difficult to retrofit because every date-formatting decision downstream depends on it.

---

## Minor Pitfalls

---

### Pitfall 10: TypeScript Bundle Mixing (Highcharts vs. HighchartsStock vs. HighchartsGantt)

**What goes wrong:** The project needs features from multiple HighCharts product tiers: standard chart types (line, area, bar), Gantt for the events timeline, and potentially Stock features for data grouping. Importing `highcharts/highstock` and then separately importing `highcharts` creates a dual-instance situation where TypeScript types conflict and runtime behavior is unpredictable.

**Prevention:** Use `highcharts/highstock` as the base import throughout (it is a superset of standard Highcharts). Load `highcharts/modules/gantt` as an addon module via the standard `Highcharts.ganttChart()` constructor. Never import both `highcharts` and `highcharts/highstock` in the same project.

**Warning signs:** TypeScript errors about incompatible `Highcharts` types across files. Charts in one component render differently than charts built with the same options in another component.

**Phase:** Address at project setup, before any chart component is written.

---

### Pitfall 11: Highcharts.charts Array Contains nulls

**What goes wrong:** When a chart is destroyed (component unmounts), `chart.destroy()` sets the entry in `Highcharts.charts` to `null` rather than removing it. Any synchronization loop that iterates `Highcharts.charts` without null-checking will throw on the null entries.

**Prevention:** Always write the sync loop as:
```typescript
Highcharts.charts
  .filter((c): c is Highcharts.Chart => !!c && c.xAxis?.length > 0)
  .forEach((chart) => { ... });
```

**Warning signs:** "Cannot read properties of null" errors in console after removing a custom chart.

**Phase:** Address in the synchronized zoom implementation phase.

---

### Pitfall 12: MUI Slider as Playback Scrubber — Event Conflict with HighCharts Zoom

**What goes wrong:** The MUI discrete slider for playback and HighCharts drag-to-zoom share the same time domain. When the user initiates a drag on the MUI slider that extends into the chart area (or vice versa), both components attempt to handle the pointer event, causing one or both interactions to fire incorrectly.

**Additionally:** HighCharts zooming intercepts `mousedown` events. If the slider is positioned below the chart canvas, and the user drags down from the chart into the slider area, HighCharts may capture the full drag and prevent the slider from responding.

**Prevention:**
1. Use `event.stopPropagation()` in HighCharts' `selection` event handler to prevent drag events from bleeding out of the chart container.
2. Give the MUI slider its own clearly bounded container with `pointer-events` managed in CSS — never overlap the slider with a chart canvas.
3. Test all pointer interactions with a touchscreen device — the conflict surface is larger on touch.

**Warning signs:** Slider does not respond to drag when the chart has focus. Chart zooms unexpectedly when user clicks the slider area.

**Phase:** Address in the playback timeline phase when integrating MUI slider with HighCharts layout.

---

### Pitfall 13: Chart Reflow Not Called After Container Resize

**What goes wrong:** MUI layout containers (Grid, Box with flex) can change dimensions after initial render — when a sidebar opens, when responsive breakpoints shift, or when the custom chart builder adds/removes a chart and the grid reflows. HighCharts does not automatically re-render to the new container size. Charts appear clipped, overflowed, or with misaligned axes.

**Prevention:** Call `chart.reflow()` after any layout-affecting state change. For container resize events, use a `ResizeObserver` on the chart wrapper div and call `reflow()` in its callback. `highcharts-react-official` does not do this automatically.

```typescript
useEffect(() => {
  const observer = new ResizeObserver(() => {
    chartRef.current?.chart?.reflow();
  });
  if (containerRef.current) observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);
```

**Warning signs:** Charts clip their content after the custom builder adds a new chart. Axes labels are cut off at certain viewport widths.

**Phase:** Address in the layout/grid phase when chart containers are first placed inside MUI Grid components.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project setup | TypeScript bundle mixing (Highcharts vs. Stock vs. Gantt) | Establish single import source at day one |
| Project setup | `useUTC` not set globally | Add `Highcharts.setOptions({ time: { useUTC: true } })` to app init |
| Default charts — first data render | `turboThreshold` silently drops data | Set `turboThreshold: 0` in shared chart defaults |
| Default charts — Events Timeline | Boost breaks Gantt series | Never apply global Boost; isolate Gantt from Boost config |
| Synchronized zoom | setExtremes feedback loop | Implement `trigger: 'syncExtremes'` guard before any testing |
| Synchronized zoom | `Highcharts.charts` contains nulls | Filter null entries in every sync loop |
| Custom chart builder | React key strategy for chart slots | Use stable UUID keys before builder UI is wired up |
| Custom chart builder | Instance leak from repeated add/remove | Guard all sync loops; verify `Highcharts.charts.length` in DevTools |
| Playback timeline | rAF stale closure traps `isPlaying` | Use `useRef` for rAF guard from first implementation |
| Playback timeline | Zustand subscriptions at 60fps | Keep playback position in ref; write to Zustand only at user-meaningful events |
| Playback timeline | MUI slider / HighCharts pointer conflict | Separate container boundaries; use `stopPropagation` in selection handler |
| Layout integration | Charts not reflowing after resize | Add `ResizeObserver` + `chart.reflow()` to chart container components |

---

## Sources

- HighCharts synchronized charts official demo (jsfiddle.net/highcharts/akvzg/) — `trigger: 'syncExtremes'` pattern confirmed [HIGH confidence]
- HighCharts `chart.events.selection` API — preventDefault and event object structure [HIGH confidence]
- HighCharts Boost module documentation — supported series types, feature limitations, default `boostThreshold: 5000` [HIGH confidence via official docs]
- HighCharts `time.timezone` API — browser-dependent timezone support, fallback to UTC offset 0 [HIGH confidence]
- HighCharts server-side data grouping docs — client-side grouping pitfalls, polling tradeoff [MEDIUM confidence]
- `highcharts-react-official` GitHub README and React docs — ref access pattern, component props [MEDIUM confidence — official docs content verified but lifecycle docs are sparse]
- MDN `requestAnimationFrame` — one-shot nature, cleanup requirement, stale closure pattern, setInterval comparison [HIGH confidence]
- React official docs (`useRef`, "You Might Not Need an Effect") — ref vs state for animation IDs, event handler vs effect for chart updates [HIGH confidence]
- HighCharts TypeScript declarations docs — beta state warning, bundle selection conflicts, `@types/highcharts` migration issues [HIGH confidence]
