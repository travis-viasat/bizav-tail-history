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
 * Description: Mock Latency and Packet Loss series data for Phase 2 proof-of-concept
 */
import type Highcharts from 'highcharts/highstock';
import {PRIMARY_PURPLE, ERROR_RED} from '../../../theme/colors';

const NOW = Date.now();
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const START = NOW - FOURTEEN_DAYS_MS;
const POINT_INTERVAL_MS = 5 * 60 * 1000; // 5-minute intervals
const NUM_POINTS = Math.floor(FOURTEEN_DAYS_MS / POINT_INTERVAL_MS); // ~4032 points

/**
 * Deterministic linear congruential generator for reproducible mock data.
 * Uses LCG: s = (s * 16807 + 0) % 2147483647 (Park-Miller parameters)
 */
function generateMockSeries(seed: number, min: number, max: number): [number, number][] {
  const data: [number, number][] = [];
  let value = (min + max) / 2;
  let s = seed;
  for (let i = 0; i < NUM_POINTS; i++) {
    const t = START + i * POINT_INTERVAL_MS;
    s = (s * 16807 + 0) % 2147483647; // LCG for reproducibility
    const rand = s / 2147483647;
    value = Math.max(min, Math.min(max, value + (rand - 0.5) * (max - min) * 0.1));
    data.push([t, Math.round(value * 10) / 10]);
  }
  return data;
}

export const MOCK_LATENCY_SERIES: Highcharts.SeriesOptionsType[] = [
  {
    type: 'line' as const,
    name: 'Avg Latency (ms)',
    data: generateMockSeries(1, 20, 800),
    color: PRIMARY_PURPLE // #724AE8
  }
];

export const MOCK_PACKET_LOSS_SERIES: Highcharts.SeriesOptionsType[] = [
  {
    type: 'line' as const,
    name: 'Packet Loss (%)',
    data: generateMockSeries(2, 0, 15),
    color: ERROR_RED // #E73737
  }
];
