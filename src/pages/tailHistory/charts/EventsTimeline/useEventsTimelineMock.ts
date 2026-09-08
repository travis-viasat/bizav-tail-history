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
 * Description: Mock hook for Events Timeline chart data (CHART-01)
 */
import {MOCK_START, MOCK_END} from '../../__mocks__/chartData';
import {
  RAG_CONNECTED,
  RAG_ACQUIRING,
  RAG_DISCONNECTED,
  SURFACE_GREY
} from '../../../../theme/colors';

const Y_CONNECTED = 0;
const Y_ACQUIRING = 1;
const Y_DISCONNECTED = 2;
const Y_NETWORK_CHANGE = 3;
const Y_TIMING_EVENT = 4;

const CATEGORY_COLORS: Record<number, string> = {
  [Y_CONNECTED]: RAG_CONNECTED,
  [Y_ACQUIRING]: RAG_ACQUIRING,
  [Y_DISCONNECTED]: RAG_DISCONNECTED,
  [Y_NETWORK_CHANGE]: SURFACE_GREY[600],
  [Y_TIMING_EVENT]: SURFACE_GREY[400]
};

function generateEventSegments(start: number, end: number): object[] {
  const segments: object[] = [];
  let cursor = start;
  let lcg = 99;

  function next(): number {
    lcg = (lcg * 16807) % 2147483647;
    return lcg / 2147483647;
  }

  while (cursor < end) {
    const r = next();
    let y: number;
    let durationMs: number;

    if (r < 0.6) {
      y = Y_CONNECTED;
      durationMs = (30 + next() * 210) * 60 * 1000;
    } else if (r < 0.75) {
      y = Y_ACQUIRING;
      durationMs = (0.5 + next() * 4.5) * 60 * 1000;
    } else if (r < 0.88) {
      y = Y_DISCONNECTED;
      durationMs = (2 + next() * 18) * 60 * 1000;
    } else if (r < 0.94) {
      y = Y_NETWORK_CHANGE;
      durationMs = (1 + next() * 4) * 60 * 1000;
    } else {
      y = Y_TIMING_EVENT;
      durationMs = (0.5 + next() * 2) * 60 * 1000;
    }

    const segEnd = Math.min(cursor + durationMs, end);
    segments.push({x: cursor, x2: segEnd, y, color: CATEGORY_COLORS[y]});
    cursor = segEnd;
  }

  return segments;
}

export interface EventsTimelineMockResult {
  series: Highcharts.SeriesOptionsType[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export function useEventsTimelineMock(): EventsTimelineMockResult {
  const series: Highcharts.SeriesOptionsType[] = [
    {
      type: 'xrange' as const,
      name: 'Connectivity State',
      colorByPoint: true,
      borderRadius: 3,
      pointWidth: 20,
      data: generateEventSegments(MOCK_START, MOCK_END) as any
    }
  ];

  return {series, isLoading: false, isEmpty: false, error: null};
}
