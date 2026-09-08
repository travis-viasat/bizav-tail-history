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
 * Description: Usage chart wrapper component (CHART-07)
 */
import React from 'react';
import {styled} from '@mui/material/styles';
import {Box, Skeleton} from '@mui/material';
import {Text} from '@viasat/beam-react';
import {v4 as uuidv4} from 'uuid';
import Highcharts from 'highcharts/highstock';
import ChartStrip from '../../../../components/ChartStrip/ChartStrip';
import type {ConnectivityEvent} from '../../../../components/ChartStrip/ChartStrip.types';
import {useUsageMock} from './useUsageMock';
import {WHITE, SURFACE_GREY} from '../../../../theme/colors';

export const CHART_ID = uuidv4();
const CHART_HEIGHT = 200;

const EmptyStripContainer = styled(Box)({
  width: '100%',
  marginBottom: '16px',
  backgroundColor: WHITE,
  borderRadius: '4px',
  border: `1px solid ${SURFACE_GREY[200]}`,
  padding: '8px 16px',
  display: 'flex',
  flexDirection: 'column'
});

interface ChartWrapperProps {
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart: (id: string) => void;
  onSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
  eventMarkers?: ConnectivityEvent[];
}

const UsageChart: React.FC<ChartWrapperProps> = ({
  registerChart,
  unregisterChart,
  onSetExtremes,
  eventMarkers
}) => {
  const {series, isLoading, isEmpty, error} = useUsageMock();

  if (isLoading) {
    return (
      <EmptyStripContainer>
        <Skeleton variant="rectangular" width="100%" height={CHART_HEIGHT} />
      </EmptyStripContainer>
    );
  }

  if (error) {
    return (
      <EmptyStripContainer>
        <Text kind="label-md" bold style={{marginBottom: 4}}>Usage</Text>
        <Text kind="body-md" color="secondary">Failed to load data.</Text>
      </EmptyStripContainer>
    );
  }

  if (isEmpty || series.length === 0) {
    return (
      <EmptyStripContainer>
        <Text kind="label-md" bold style={{marginBottom: 4}}>Usage</Text>
        <Text kind="body-md" color="secondary">No data available for this period.</Text>
      </EmptyStripContainer>
    );
  }

  return (
    <ChartStrip
      chartId={CHART_ID}
      title="Usage"
      series={series}
      registerChart={registerChart}
      unregisterChart={unregisterChart}
      onSetExtremes={onSetExtremes}
      height={CHART_HEIGHT}
      legendEnabled={true}
      eventMarkers={eventMarkers}
    />
  );
};

export default UsageChart;
