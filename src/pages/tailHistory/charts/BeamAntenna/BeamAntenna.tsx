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
 * Description: Beam & Antenna chart wrapper — renders 3 ChartStrip instances (CHART-08)
 */
import React from 'react';
import {styled} from '@mui/material/styles';
import {Box, Skeleton} from '@mui/material';
import {Text} from '@viasat/beam-react';
import Highcharts from 'highcharts/highstock';
import ChartStrip from '../../../../components/ChartStrip/ChartStrip';
import type {ConnectivityEvent} from '../../../../components/ChartStrip/ChartStrip.types';
import {useBeamAntennaMock, BEAM_THROUGHPUT_CHART_ID, LINK_QUALITY_CHART_ID, ANTENNA_POINTING_CHART_ID} from './useBeamAntennaMock';

export {BEAM_THROUGHPUT_CHART_ID, LINK_QUALITY_CHART_ID, ANTENNA_POINTING_CHART_ID};
import {WHITE, SURFACE_GREY} from '../../../../theme/colors';

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

interface BeamAntennaChartProps {
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart: (id: string) => void;
  onBeamThroughputSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
  onLinkQualitySetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
  onAntennaPointingSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
  eventMarkers?: ConnectivityEvent[];
}

const stripHandlers = [
  'onBeamThroughputSetExtremes',
  'onLinkQualitySetExtremes',
  'onAntennaPointingSetExtremes'
] as const;

const BeamAntenna: React.FC<BeamAntennaChartProps> = ({
  registerChart,
  unregisterChart,
  onBeamThroughputSetExtremes,
  onLinkQualitySetExtremes,
  onAntennaPointingSetExtremes,
  eventMarkers
}) => {
  const {strips, isLoading, isEmpty, error} = useBeamAntennaMock();
  const handlers = [onBeamThroughputSetExtremes, onLinkQualitySetExtremes, onAntennaPointingSetExtremes];

  if (isLoading) {
    return (
      <>
        {stripHandlers.map((key) => (
          <EmptyStripContainer key={key}>
            <Skeleton variant="rectangular" width="100%" height={CHART_HEIGHT} />
          </EmptyStripContainer>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <>
        {['Beam Throughput', 'Link Quality', 'Antenna Pointing'].map((title) => (
          <EmptyStripContainer key={title}>
            <Text kind="label-md" bold style={{marginBottom: 4}}>{title}</Text>
            <Text kind="body-md" color="secondary">Failed to load data.</Text>
          </EmptyStripContainer>
        ))}
      </>
    );
  }

  if (isEmpty || strips.length === 0) {
    return (
      <>
        {['Beam Throughput', 'Link Quality', 'Antenna Pointing'].map((title) => (
          <EmptyStripContainer key={title}>
            <Text kind="label-md" bold style={{marginBottom: 4}}>{title}</Text>
            <Text kind="body-md" color="secondary">No data available for this period.</Text>
          </EmptyStripContainer>
        ))}
      </>
    );
  }

  return (
    <>
      {strips.map((strip, i) => (
        <ChartStrip
          key={strip.chartId}
          chartId={strip.chartId}
          title={strip.title}
          series={strip.series}
          registerChart={registerChart}
          unregisterChart={unregisterChart}
          onSetExtremes={handlers[i]}
          height={CHART_HEIGHT}
          legendEnabled={true}
          eventMarkers={eventMarkers}
        />
      ))}
    </>
  );
};

export default BeamAntenna;
