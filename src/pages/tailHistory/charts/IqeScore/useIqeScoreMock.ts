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
 * Description: Mock hook for iQe Score chart data (CHART-02)
 */
import {generateMockSeries} from '../../__mocks__/chartData';
import {
  PRIMARY_PURPLE,
  PRIMARY_LIGHT_PURPLE,
  BOLD_BLUE,
  ERROR_RED,
  SUCCESS_GREEN,
  WARNING_AMBER,
  SURFACE_GREY
} from '../../../../theme/colors';

export interface IqeScoreMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export function useIqeScoreMock(): IqeScoreMockResult {
  const series: Highcharts.SeriesOptionsType[] = [
    {type: 'line' as const, name: 'iQe Score', data: generateMockSeries(10, 0, 100), color: PRIMARY_PURPLE},
    {type: 'line' as const, name: 'Download Performance', data: generateMockSeries(11, 0, 100), color: BOLD_BLUE},
    {type: 'line' as const, name: 'Upload Performance', data: generateMockSeries(12, 0, 100), color: SUCCESS_GREEN},
    {type: 'line' as const, name: 'Network Availability', data: generateMockSeries(13, 0, 100), color: WARNING_AMBER},
    {type: 'line' as const, name: 'Signal Strength', data: generateMockSeries(14, -80, -40), color: ERROR_RED},
    {type: 'line' as const, name: 'Beam Transition', data: generateMockSeries(15, 0, 10), color: SURFACE_GREY[600]},
    {type: 'line' as const, name: 'Transmission Resilience', data: generateMockSeries(16, 0, 100), color: SURFACE_GREY[400]},
    {type: 'line' as const, name: 'Month-to-date WPS', data: generateMockSeries(17, 0, 1000), color: PRIMARY_LIGHT_PURPLE}
  ];

  return {series, isLoading: false, isEmpty: false, error: null};
}
