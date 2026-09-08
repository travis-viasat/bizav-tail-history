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
 * Description: Mock hook for Traffic Composition chart data (CHART-05)
 */
import {generateMockSeries} from '../../__mocks__/chartData';
import {PRIMARY_PURPLE, BOLD_BLUE, SUCCESS_GREEN, SURFACE_GREY} from '../../../../theme/colors';

export interface TrafficCompositionMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: Error | null;
}

export function useTrafficCompositionMock(): TrafficCompositionMockResult {
  const series: Highcharts.SeriesOptionsType[] = [
    {
      type: 'area' as const,
      stacking: 'normal',
      fillOpacity: 0.7,
      name: 'Streaming',
      data: generateMockSeries(40, 0, 50),
      color: PRIMARY_PURPLE
    },
    {
      type: 'area' as const,
      stacking: 'normal',
      fillOpacity: 0.7,
      name: 'Browsing',
      data: generateMockSeries(41, 0, 30),
      color: BOLD_BLUE
    },
    {
      type: 'area' as const,
      stacking: 'normal',
      fillOpacity: 0.7,
      name: 'VoIP',
      data: generateMockSeries(42, 0, 10),
      color: SUCCESS_GREEN
    },
    {
      type: 'area' as const,
      stacking: 'normal',
      fillOpacity: 0.7,
      name: 'Other',
      data: generateMockSeries(43, 0, 20),
      color: SURFACE_GREY[400]
    }
  ];

  return {
    series,
    isLoading: false,
    isEmpty: false,
    error: null
  };
}
