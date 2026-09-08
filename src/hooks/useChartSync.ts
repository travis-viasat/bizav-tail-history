/***
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * The information in this software is subject to change without notice and
 * should not be construed as a commitment by Viasat, Inc.
 *
 * Viasat Proprietary
 * The Proprietary Information provided herein is proprietary to Viasat and
 * must be protected from further distribution and use. Disclosure to others,
 * use or copying without express written authorization of Viasat, is strictly
 * prohibited.
 *
 * Description: Hook providing the setExtremes sync handler with feedback-loop guard
 */
import {useCallback} from 'react';
import type Highcharts from 'highcharts/highstock';
import useTailHistoryStore from '../pages/tailHistory/tailHistoryStore';

/**
 * SYNC_TRIGGER is the sentinel string placed in the trigger field of every
 * programmatic setExtremes call. The handler checks this value FIRST — if it
 * matches, the handler returns immediately, preventing infinite feedback loops
 * where chart A triggers chart B which triggers chart A again.
 */
export const SYNC_TRIGGER = 'syncExtremes';

/**
 * useChartSync wires synchronized zoom across all charts held in a shared
 * chartRegistryRef. It returns:
 *   - makeSetExtremesHandler(chartId) — factory that creates a per-chart
 *     xAxis.events.setExtremes handler with the feedback-loop guard built in
 *   - resetZoom() — restores all charts to their auto-computed extremes and
 *     clears the zoomedRange from the Zustand store
 */
export function useChartSync(
  chartRegistryRef: React.RefObject<Map<string, Highcharts.Chart> | null>
) {
  const setZoomedRange = useTailHistoryStore(state => state.setZoomedRange);

  const makeSetExtremesHandler = useCallback(
    (ownChartId: string) =>
      (e: Highcharts.AxisSetExtremesEventObject) => {
        // CRITICAL: Guard against feedback loop — MUST be the FIRST line
        if (e.trigger === SYNC_TRIGGER) return;

        const {min, max} = e;

        // Write zoomed range to Zustand so ZoomControls slider can reflect it
        if (min !== undefined && max !== undefined) {
          setZoomedRange({min, max});
        } else {
          setZoomedRange(null);
        }

        // Propagate to every OTHER chart in the registry with the guard trigger
        chartRegistryRef.current?.forEach((chart, id) => {
          if (id === ownChartId) return; // skip self — no echo
          const axis = chart.xAxis[0];
          if (!axis) return;
          axis.setExtremes(min, max, true, false, {trigger: SYNC_TRIGGER});
        });
      },
    [chartRegistryRef, setZoomedRange]
  );

  const resetZoom = useCallback(() => {
    setZoomedRange(null);
    chartRegistryRef.current?.forEach(chart => {
      const axis = chart.xAxis[0];
      if (!axis) return;
      // undefined (NOT null) restores auto-computed extremes;
      // null would coerce to 0 (epoch = Jan 1 1970)
      axis.setExtremes(undefined, undefined, true, false, {trigger: SYNC_TRIGGER});
    });
  }, [chartRegistryRef, setZoomedRange]);

  return {makeSetExtremesHandler, resetZoom};
}
