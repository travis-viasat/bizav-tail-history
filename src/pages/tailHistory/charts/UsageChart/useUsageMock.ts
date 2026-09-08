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
 * Description: Mock hook for Usage chart data (CHART-07)
 */
import {generateMockSeries} from '../../__mocks__/chartData';
import {PRIMARY_PURPLE, BOLD_BLUE, SURFACE_GREY} from '../../../../theme/colors';

export interface UsageMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export function useUsageMock(): UsageMockResult {
  const downloadData = generateMockSeries(60, 0, 50);
  const uploadData = generateMockSeries(61, 0, 20);

  const cumulativeData: [number, number][] = [];
  let runningTotal = 0;
  for (let i = 0; i < downloadData.length; i++) {
    runningTotal += downloadData[i][1] + uploadData[i][1];
    cumulativeData.push([downloadData[i][0], Math.round(runningTotal * 10) / 10]);
  }

  const series: Highcharts.SeriesOptionsType[] = [
    {type: 'line' as const, name: 'Download Usage (GB)', data: downloadData, color: PRIMARY_PURPLE},
    {type: 'line' as const, name: 'Upload Usage (GB)', data: uploadData, color: BOLD_BLUE},
    {type: 'line' as const, name: 'Cumulative Usage (GB)', data: cumulativeData, color: SURFACE_GREY[600]}
  ];

  return {series, isLoading: false, isEmpty: false, error: null};
}
