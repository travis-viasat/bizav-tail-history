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
 * Description: Mock hook for Latency & Packet Loss chart data (CHART-06)
 */
import {generateMockSeries} from '../../__mocks__/chartData';
import {PRIMARY_PURPLE, ERROR_RED, SURFACE_GREY} from '../../../../theme/colors';

export interface LatencyPacketLossMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export function useLatencyPacketLossMock(): LatencyPacketLossMockResult {
  const series: Highcharts.SeriesOptionsType[] = [
    {type: 'line' as const, name: 'Avg Latency (ms)', data: generateMockSeries(1, 20, 800), color: PRIMARY_PURPLE, yAxis: 0},
    {type: 'line' as const, name: 'Min Latency (ms)', data: generateMockSeries(50, 15, 400), color: SURFACE_GREY[400], yAxis: 0},
    {type: 'line' as const, name: 'Max Latency (ms)', data: generateMockSeries(51, 50, 1500), color: SURFACE_GREY[600], yAxis: 0},
    {type: 'line' as const, name: 'Packet Loss %', data: generateMockSeries(2, 0, 15), color: ERROR_RED, yAxis: 1}
  ];

  return {series, isLoading: false, isEmpty: false, error: null};
}
