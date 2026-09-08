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
 * Description: Generic mock hook for custom chart data — returns seeded time-series
 * data for each metricId in a multi-metric chart. One series per metric with
 * deterministic, visually distinct colors.
 */
import {useMemo} from 'react';
import type Highcharts from 'highcharts/highstock';
import {generateMockSeries} from '../../__mocks__/chartData';
import {CUSTOM_CHART_COLORS} from '../../../../theme/colors';
import {METRIC_CATALOG} from '../../../../catalog/metricCatalog';
import type {ChartType} from '../../../../catalog/metricCatalog';

export interface CustomChartMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: Error | null;
}

/**
 * Generates one mock series per metricId. Each metric gets a deterministic
 * color and seed so the chart is visually distinct and reproducible.
 */
export function useCustomChartMock(
  metricIds: string[],
  chartType: ChartType
): CustomChartMockResult {
  const series: Highcharts.SeriesOptionsType[] = useMemo(() => {
    return metricIds.map((metricId, index) => {
      const seed = metricId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const color = CUSTOM_CHART_COLORS[(seed + index) % CUSTOM_CHART_COLORS.length];
      const metricDef = METRIC_CATALOG.find(m => m.key === metricId);
      const name = metricDef?.label ?? metricId;
      return {
        type: chartType as any,
        name,
        data: generateMockSeries(seed + index, 0, 100),
        color
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricIds.join(','), chartType]);

  return {series, isLoading: false, isEmpty: false, error: null};
}
