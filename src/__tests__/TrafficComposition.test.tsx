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
 * Description: Tests for TrafficComposition chart wrapper (CHART-05)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

// Mock @highcharts/react/Stock before importing anything that uses it
vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(() => <div data-testid="mock-stockchart" />)
}));

// Mock xrange module so it doesn't fail in jsdom
vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

// Use vi.hoisted to create mock function before vi.mock is hoisted
const {mockUseTrafficCompositionMock} = vi.hoisted(() => ({
  mockUseTrafficCompositionMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/TrafficComposition/useTrafficCompositionMock', () => ({
  useTrafficCompositionMock: mockUseTrafficCompositionMock
}));

import TrafficComposition from '../pages/tailHistory/charts/TrafficComposition/TrafficComposition';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

const mockSeries: any[] = [
  {type: 'area', name: 'Streaming', stacking: 'normal', fillOpacity: 0.7, data: [[1000, 20]], color: '#724AE8'},
  {type: 'area', name: 'Browsing', stacking: 'normal', fillOpacity: 0.7, data: [[1000, 15]], color: '#185C87'},
  {type: 'area', name: 'VoIP', stacking: 'normal', fillOpacity: 0.7, data: [[1000, 5]], color: '#00C853'},
  {type: 'area', name: 'Other', stacking: 'normal', fillOpacity: 0.7, data: [[1000, 10]], color: '#9FAFBC'}
];

describe('TrafficComposition (CHART-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart title "Traffic Composition" when data is available', () => {
    mockUseTrafficCompositionMock.mockReturnValue({
      series: mockSeries,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<TrafficComposition {...defaultProps} />);
    expect(screen.getByText('Traffic Composition')).toBeInTheDocument();
    expect(screen.getByTestId('mock-stockchart')).toBeInTheDocument();
  });

  it('renders MUI Skeleton (no stockchart) when isLoading=true', () => {
    mockUseTrafficCompositionMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<TrafficComposition {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeNull();
  });

  it('renders "No data available for this period." when isEmpty=true', () => {
    mockUseTrafficCompositionMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<TrafficComposition {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders "Failed to load data." when error is non-null', () => {
    mockUseTrafficCompositionMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<TrafficComposition {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
