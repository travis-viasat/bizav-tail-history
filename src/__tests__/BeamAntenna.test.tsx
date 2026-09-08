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
 * Description: Tests for BeamAntenna chart wrapper (CHART-08)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(() => <div data-testid="mock-stockchart" />)
}));

vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

const {mockUseBeamAntennaMock} = vi.hoisted(() => ({
  mockUseBeamAntennaMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/BeamAntenna/useBeamAntennaMock', () => ({
  useBeamAntennaMock: mockUseBeamAntennaMock,
  BEAM_THROUGHPUT_CHART_ID: 'beam-throughput-id',
  LINK_QUALITY_CHART_ID: 'link-quality-id',
  ANTENNA_POINTING_CHART_ID: 'antenna-pointing-id'
}));

import BeamAntenna from '../pages/tailHistory/charts/BeamAntenna/BeamAntenna';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onBeamThroughputSetExtremes: vi.fn(),
  onLinkQualitySetExtremes: vi.fn(),
  onAntennaPointingSetExtremes: vi.fn()
};

const mockStrips = [
  {
    title: 'Beam Throughput',
    chartId: 'beam-throughput-id',
    series: [{type: 'line', name: 'Beam Download', data: [[1000, 50]], color: '#724AE8'}]
  },
  {
    title: 'Link Quality',
    chartId: 'link-quality-id',
    series: [{type: 'line', name: 'Forward Link Quality', data: [[1000, 80]], color: '#724AE8'}]
  },
  {
    title: 'Antenna Pointing',
    chartId: 'antenna-pointing-id',
    series: [{type: 'line', name: 'Azimuth deg', data: [[1000, 180]], color: '#724AE8'}]
  }
];

describe('BeamAntenna (CHART-08)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3 strip titles when data is available', () => {
    mockUseBeamAntennaMock.mockReturnValue({
      strips: mockStrips,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<BeamAntenna {...defaultProps} />);
    expect(screen.getByText('Beam Throughput')).toBeInTheDocument();
    expect(screen.getByText('Link Quality')).toBeInTheDocument();
    expect(screen.getByText('Antenna Pointing')).toBeInTheDocument();
  });

  it('renders 3 MUI Skeletons (no stockchart) when isLoading=true', () => {
    mockUseBeamAntennaMock.mockReturnValue({
      strips: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<BeamAntenna {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThanOrEqual(3);
  });

  it('renders 3 empty state messages when isEmpty=true', () => {
    mockUseBeamAntennaMock.mockReturnValue({
      strips: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<BeamAntenna {...defaultProps} />);
    const msgs = screen.getAllByText('No data available for this period.');
    expect(msgs.length).toBe(3);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders 3 error messages when error is non-null', () => {
    mockUseBeamAntennaMock.mockReturnValue({
      strips: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<BeamAntenna {...defaultProps} />);
    const msgs = screen.getAllByText('Failed to load data.');
    expect(msgs.length).toBe(3);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
