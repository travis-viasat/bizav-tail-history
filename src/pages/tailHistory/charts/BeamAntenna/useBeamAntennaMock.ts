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
 * Description: Mock hook for Beam & Antenna chart data (CHART-08)
 */
import {v4 as uuidv4} from 'uuid';
import {generateMockSeries} from '../../__mocks__/chartData';
import {PRIMARY_PURPLE, BOLD_BLUE} from '../../../../theme/colors';

export const BEAM_THROUGHPUT_CHART_ID = uuidv4();
export const LINK_QUALITY_CHART_ID = uuidv4();
export const ANTENNA_POINTING_CHART_ID = uuidv4();

export interface BeamAntennaStrip {
  title: string;
  chartId: string;
  series: Highcharts.SeriesOptionsType[];
}

export interface BeamAntennaMockResult {
  strips: BeamAntennaStrip[];
  isLoading: boolean;
  isEmpty: boolean;
  error: string | null;
}

export function useBeamAntennaMock(): BeamAntennaMockResult {
  const strips: BeamAntennaStrip[] = [
    {
      title: 'Beam Throughput',
      chartId: BEAM_THROUGHPUT_CHART_ID,
      series: [
        {type: 'line' as const, name: 'Beam Download', data: generateMockSeries(70, 0, 150), color: PRIMARY_PURPLE},
        {type: 'line' as const, name: 'Beam Upload', data: generateMockSeries(71, 0, 30), color: BOLD_BLUE}
      ]
    },
    {
      title: 'Link Quality',
      chartId: LINK_QUALITY_CHART_ID,
      series: [
        {type: 'line' as const, name: 'Forward Link Quality', data: generateMockSeries(72, 0, 100), color: PRIMARY_PURPLE},
        {type: 'line' as const, name: 'Return Link Quality', data: generateMockSeries(73, 0, 100), color: BOLD_BLUE}
      ]
    },
    {
      title: 'Antenna Pointing',
      chartId: ANTENNA_POINTING_CHART_ID,
      series: [
        {type: 'line' as const, name: 'Azimuth deg', data: generateMockSeries(74, 0, 360), color: PRIMARY_PURPLE},
        {type: 'line' as const, name: 'Elevation deg', data: generateMockSeries(75, 0, 90), color: BOLD_BLUE}
      ]
    }
  ];

  return {strips, isLoading: false, isEmpty: false, error: null};
}
