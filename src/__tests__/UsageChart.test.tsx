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
 * Description: Tests for UsageChart wrapper (CHART-07)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(() => <div data-testid="mock-stockchart" />)
}));

vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

const {mockUseUsageMock} = vi.hoisted(() => ({
  mockUseUsageMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/UsageChart/useUsageMock', () => ({
  useUsageMock: mockUseUsageMock
}));

import UsageChart from '../pages/tailHistory/charts/UsageChart/UsageChart';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

const mockSeries: any[] = [
  {type: 'line', name: 'Download Usage (GB)', data: [[1000, 25]], color: '#724AE8'},
  {type: 'line', name: 'Upload Usage (GB)', data: [[1000, 10]], color: '#185C87'},
  {type: 'line', name: 'Cumulative Usage (GB)', data: [[1000, 35]], color: '#465967'}
];

describe('UsageChart (CHART-07)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart title "Usage" when data is available', () => {
    mockUseUsageMock.mockReturnValue({
      series: mockSeries,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<UsageChart {...defaultProps} />);
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByTestId('mock-stockchart')).toBeInTheDocument();
  });

  it('renders MUI Skeleton (no stockchart) when isLoading=true', () => {
    mockUseUsageMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<UsageChart {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeNull();
  });

  it('renders "No data available for this period." when isEmpty=true', () => {
    mockUseUsageMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<UsageChart {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders "Failed to load data." when error is non-null', () => {
    mockUseUsageMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<UsageChart {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
