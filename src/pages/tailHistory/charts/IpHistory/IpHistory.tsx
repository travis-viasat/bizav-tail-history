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
 * Description: IP History chart wrapper — integrates @viasat/ip-history-chart into
 * the default Tail History chart grid. Adapts the parent's onSetExtremes
 * (Highcharts.AxisSetExtremesEventObject) signature to the package's
 * (start: number, end: number) signature.
 */
import React, {useMemo, useCallback} from 'react';
import {Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import {v4 as uuidv4} from 'uuid';
import Highcharts from 'highcharts/highstock';
import {IpHistoryChart} from '@viasat/ip-history-chart';
import type {ConnectivityEvent as IpHistoryConnectivityEvent} from '@viasat/ip-history-chart';
import type {ConnectivityEvent} from '../../../../components/ChartStrip/ChartStrip.types';
import {SURFACE_GREY, WHITE} from '../../../../theme/colors';
import useTailHistoryStore from '../../tailHistoryStore';
import {useIpHistoryMock} from './useIpHistoryMock';

export const CHART_ID = uuidv4();

/**
 * StripContainer mirrors ChartStrip's StripContainer exactly so the IP History
 * card matches every other default chart visually.  The nested MuiPaper-root
 * override strips the vendor's own Paper card (background, border, borderRadius,
 * boxShadow, padding) so we don't render two stacked cards.
 */
const StripContainer = styled(Box)({
  width: '100%',
  marginBottom: '16px',
  backgroundColor: WHITE,
  borderRadius: '4px',
  border: `1px solid ${SURFACE_GREY[200]}`,
  padding: '8px 16px',
  // Cancel the vendor's inner ChartContainer (styled MUI Paper) so we don't
  // render two nested card borders.
  '& .MuiPaper-root': {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    padding: 0
  }
});

type ReviewIpHistoryState = 'loading' | 'error' | 'empty' | 'populated';

interface ChartWrapperProps {
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart: (id: string) => void;
  onSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
  eventMarkers?: ConnectivityEvent[];
  _reviewIpHistoryState?: ReviewIpHistoryState;
}

/**
 * Adapts ChartStrip-style event markers (ConnectivityEvent from ChartStrip.types)
 * to the ip-history-chart package's ConnectivityEvent type.
 */
function adaptEventMarkers(
  markers?: ConnectivityEvent[]
): IpHistoryConnectivityEvent[] | undefined {
  if (!markers) return undefined;
  return markers.map(m => ({
    x: (m as any).x,
    x2: (m as any).x2,
    state: (m as any).state,
    y: (m as any).y,
    name: (m as any).name,
    color: m.color
  }));
}

const IpHistory: React.FC<ChartWrapperProps> = ({
  registerChart,
  unregisterChart,
  onSetExtremes,
  eventMarkers,
  _reviewIpHistoryState
}) => {
  // Get date range from the Tail History Zustand store (epoch ms)
  const timeRange = useTailHistoryStore(state => state.timeRange);

  // Convert epoch ms to Date objects required by IpHistoryChart
  const dateRange = useMemo(
    () => ({
      start: new Date(timeRange.start),
      end: new Date(timeRange.end)
    }),
    [timeRange.start, timeRange.end]
  );

  // Generate deterministic mock data (replaces live data fetch in proof-of-concept)
  const {events, isLoading, error} = useIpHistoryMock();

  // Review overrides — force specific chart states for stakeholder review pages
  const effectiveIsLoading = _reviewIpHistoryState === 'loading' ? true : isLoading;
  const effectiveError = _reviewIpHistoryState === 'error' ? 'Failed to load IP history data' : error;
  const effectiveData = _reviewIpHistoryState === 'empty' ? [] : events;
  const effectiveExternalIsLoading = _reviewIpHistoryState === 'empty' ? false : effectiveIsLoading;

  // Adapt the parent's Highcharts.AxisSetExtremesEventObject handler to the
  // IpHistoryChart API which delivers raw (start: number, end: number).
  const handleSetExtremes = useMemo(
    () => (start: number, end: number) => {
      // Synthesise a minimal AxisSetExtremesEventObject so useChartSync can
      // process it.  The trigger must NOT be 'syncExtremes' (that sentinel is
      // reserved for programmatic propagation and would short-circuit the
      // handler immediately).  Using 'zoom' mirrors what Highcharts itself sets
      // when the user drags to zoom on a regular chart.
      const synthetic = {min: start, max: end, trigger: 'zoom'} as unknown as Highcharts.AxisSetExtremesEventObject;
      onSetExtremes(synthetic);
    },
    [onSetExtremes]
  );

  const adaptedEventMarkers = useMemo(
    () => adaptEventMarkers(eventMarkers),
    [eventMarkers]
  );

  // Intercept registerChart — fires immediately after HighCharts.chart() completes,
  // so this is the earliest reliable point to override vendor baked-in options.
  //
  // Goals:
  // - Match ChartStrip's Highcharts SVG title (font, weight, color, position)
  // - Move y-axis labels to the right (consistent with ChartStrip series labels)
  // - Align left/right margins with ChartStrip so the x-axis tracks visually
  const handleRegisterChart = useCallback(
    (id: string, chart: Highcharts.Chart) => {
      registerChart(id, chart);
      chart.update(
        {
          chart: {marginLeft: 10, marginTop: 44, marginRight: 140},
          title: {
            text: 'IP History',
            align: 'left',
            margin: 16,
            y: 14,
            style: {fontSize: '13px', fontWeight: '600', color: SURFACE_GREY[800]},
          },
          yAxis: {opposite: true, labels: {align: 'left', x: 8}},
        },
        true
      );
    },
    [registerChart]
  );

  return (
    <StripContainer>
      <IpHistoryChart
        tailId="mock-tail"
        dateRange={dateRange}
        data={effectiveData}
        isLoading={effectiveExternalIsLoading}
        error={effectiveError}
        registerChart={handleRegisterChart}
        unregisterChart={unregisterChart}
        onSetExtremes={handleSetExtremes}
        eventMarkers={adaptedEventMarkers}
        title=""
        height={200}
      />
    </StripContainer>
  );
};

export default IpHistory;
