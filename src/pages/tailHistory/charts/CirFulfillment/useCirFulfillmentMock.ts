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
 * Description: Mock hook for CIR Fulfillment chart data (CHART-04)
 */
import {generateMockSeries, MOCK_START, MOCK_END} from '../../__mocks__/chartData';
import {
  PRIMARY_PURPLE,
  PRIMARY_LIGHT_PURPLE,
  BOLD_BLUE,
  LIGHT_LIGHT_BLUE
} from '../../../../theme/colors';

// Suppress unused variable warnings — MOCK_END is exported for potential consumer use
void MOCK_START;
void MOCK_END;

export interface CirFulfillmentMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: Error | null;
}

/**
 * Generates a low-volatility series that produces a near-flat reference line.
 * Uses a much smaller step factor (0.02 vs 0.1) to simulate a committed rate
 * that remains relatively stable across the time window.
 */
function generateLowVolatilitySeries(seed: number, min: number, max: number): [number, number][] {
  const NOW = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const START = NOW - FOURTEEN_DAYS_MS;
  const POINT_INTERVAL_MS = 5 * 60 * 1000;
  const NUM_POINTS = Math.floor(FOURTEEN_DAYS_MS / POINT_INTERVAL_MS);

  const data: [number, number][] = [];
  let value = (min + max) / 2;
  let s = seed;
  for (let i = 0; i < NUM_POINTS; i++) {
    const t = START + i * POINT_INTERVAL_MS;
    s = (s * 16807 + 0) % 2147483647;
    const rand = s / 2147483647;
    value = Math.max(min, Math.min(max, value + (rand - 0.5) * (max - min) * 0.02));
    data.push([t, Math.round(value * 10) / 10]);
  }
  return data;
}

export function useCirFulfillmentMock(): CirFulfillmentMockResult {
  const series: Highcharts.SeriesOptionsType[] = [
    {
      type: 'line' as const,
      name: 'Downstream Actual (Mbps)',
      data: generateMockSeries(30, 0, 100),
      color: PRIMARY_PURPLE
    },
    {
      type: 'line' as const,
      name: 'Downstream Committed (Mbps)',
      data: generateLowVolatilitySeries(31, 5, 80),
      color: PRIMARY_LIGHT_PURPLE
    },
    {
      type: 'line' as const,
      name: 'Upstream Actual (Mbps)',
      data: generateMockSeries(32, 0, 20),
      color: BOLD_BLUE
    },
    {
      type: 'line' as const,
      name: 'Upstream Committed (Mbps)',
      data: generateLowVolatilitySeries(33, 1, 15),
      color: LIGHT_LIGHT_BLUE
    }
  ];

  return {
    series,
    isLoading: false,
    isEmpty: false,
    error: null
  };
}
