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
 * Description: Tail History page root — holds chart registry ref and register/unregister callbacks
 */
import React, {useRef, useCallback, useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {styled} from '@mui/material/styles';
import {Box, Typography} from '@mui/material';
import Highcharts from 'highcharts/highstock';
import {v4 as uuidv4} from 'uuid';
import PageHeader from './PageHeader';
import ChartStrip from '../../components/ChartStrip/ChartStrip';
import ZoomControls from './ZoomControls';
import {useChartSync} from '../../hooks/useChartSync';
import {MOCK_LATENCY_SERIES, MOCK_PACKET_LOSS_SERIES} from './__mocks__/chartData';
import {SURFACE_GREY} from '../../theme/colors';

// Stable IDs — defined OUTSIDE component to prevent re-creation on every render
const LATENCY_CHART_ID = uuidv4();
const PACKET_LOSS_CHART_ID = uuidv4();

const PageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: SURFACE_GREY[100]
});

const ContentArea = styled(Box)({
  flex: 1,
  padding: '24px 32px'
});

const TailHistoryPage: React.FC = () => {
  const {tailId} = useParams<{tailId: string}>();

  // Chart registry: holds Highcharts.Chart instances by stable UUID.
  // Held in a ref (not state) so updates never trigger a re-render (per D-07).
  const chartRegistryRef = useRef<Map<string, Highcharts.Chart>>(new Map());

  const registerChart = useCallback((id: string, chart: Highcharts.Chart) => {
    chartRegistryRef.current.set(id, chart);
  }, []);

  const unregisterChart = useCallback((id: string) => {
    chartRegistryRef.current.delete(id);
  }, []);

  const {makeSetExtremesHandler, resetZoom} = useChartSync(chartRegistryRef);

  // Memoize per-chart handlers to prevent new function references on every render.
  // Inline makeSetExtremesHandler(...) calls in JSX would create new references
  // each render, causing Highcharts to reattach event listeners continuously.
  const latencyHandler = useMemo(
    () => makeSetExtremesHandler(LATENCY_CHART_ID),
    [makeSetExtremesHandler]
  );
  const packetLossHandler = useMemo(
    () => makeSetExtremesHandler(PACKET_LOSS_CHART_ID),
    [makeSetExtremesHandler]
  );

  if (!tailId) {
    return (
      <PageContainer>
        <ContentArea>
          <Typography variant="h6">No tail selected</Typography>
          <Typography variant="body1" color="text.secondary">
            Return to the fleet view and select a tail to see its history.
          </Typography>
        </ContentArea>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader tailId={tailId} />
      <ZoomControls onResetZoom={resetZoom} />
      <ContentArea>
        <ChartStrip
          chartId={LATENCY_CHART_ID}
          title="Latency"
          series={MOCK_LATENCY_SERIES}
          registerChart={registerChart}
          unregisterChart={unregisterChart}
          onSetExtremes={latencyHandler}
        />
        <ChartStrip
          chartId={PACKET_LOSS_CHART_ID}
          title="Packet Loss"
          series={MOCK_PACKET_LOSS_SERIES}
          registerChart={registerChart}
          unregisterChart={unregisterChart}
          onSetExtremes={packetLossHandler}
        />
      </ContentArea>
    </PageContainer>
  );
};

export default TailHistoryPage;
