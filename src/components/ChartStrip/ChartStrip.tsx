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
 * Description: Reusable chart container that wires zoom sync into every chart
 */
import React, {useRef, useEffect} from 'react';
import {styled} from '@mui/material/styles';
import {Box, Typography} from '@mui/material';
import Highcharts from 'highcharts/highstock';
import {StockChart} from '@highcharts/react/Stock';
import {SURFACE_GREY, WHITE} from '../../theme/colors';
import type {ChartStripProps} from './ChartStrip.types';

const StripContainer = styled(Box)({
  width: '100%',
  marginBottom: '16px',
  backgroundColor: WHITE,
  borderRadius: '4px',
  border: `1px solid ${SURFACE_GREY[200]}`,
  padding: '8px 16px'
});

const ChartStrip: React.FC<ChartStripProps> = ({
  chartId,
  title,
  series,
  registerChart,
  unregisterChart,
  onSetExtremes,
  height = 200
}) => {
  const chartRef = useRef<any>(null);

  // Build the Highcharts options object. The chart.events.load callback
  // registers the chart instance via the parent's registerChart callback.
  // This is deliberately done via chart.events.load rather than useEffect
  // because the chart instance is only available after Highcharts initializes
  // it internally — useEffect fires after the React render cycle but the
  // chart may not yet have a valid xAxis at that point.
  const chartOptions: Highcharts.Options = {
    chart: {
      height,
      animation: false,
      backgroundColor: 'transparent',
      zooming: {
        type: 'x',
        resetButton: {
          theme: {
            display: 'none'
          }
        }
      },
      events: {
        load: function (this: Highcharts.Chart) {
          registerChart(chartId, this);
        }
      }
    },
    xAxis: {
      type: 'datetime',
      events: {
        setExtremes: onSetExtremes
      }
    },
    yAxis: {
      title: {
        text: null
      }
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    navigator: {
      enabled: false
    },
    scrollbar: {
      enabled: false
    },
    rangeSelector: {
      enabled: false
    },
    series
  };

  // Cleanup: deregister the chart when the component unmounts or chartId changes
  useEffect(() => {
    return () => {
      unregisterChart(chartId);
    };
  }, [chartId, unregisterChart]);

  return (
    <StripContainer>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <StockChart ref={chartRef} options={chartOptions} highcharts={Highcharts} />
    </StripContainer>
  );
};

export default ChartStrip;
