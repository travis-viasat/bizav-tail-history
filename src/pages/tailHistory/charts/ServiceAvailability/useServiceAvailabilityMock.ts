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
 * Description: Mock hook for Service Availability chart data (CHART-03)
 */
import {generateMockSeries} from '../../__mocks__/chartData';
import {PRIMARY_PURPLE, BOLD_BLUE, ERROR_RED} from '../../../../theme/colors';

export interface ServiceAvailabilityMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export function useServiceAvailabilityMock(): ServiceAvailabilityMockResult {
  const series: Highcharts.SeriesOptionsType[] = [
    {type: 'line' as const, name: 'Service Availability %', data: generateMockSeries(20, 0, 100), color: PRIMARY_PURPLE},
    {type: 'line' as const, name: 'CIR Downstream Sat %', data: generateMockSeries(21, 0, 100), color: BOLD_BLUE},
    {type: 'line' as const, name: 'CIR Upstream Sat %', data: generateMockSeries(22, 0, 100), color: ERROR_RED}
  ];

  return {series, isLoading: false, isEmpty: false, error: null};
}
