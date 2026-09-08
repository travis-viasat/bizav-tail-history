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
 * Description: Tests for IqeScore chart wrapper (CHART-02)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

// Mock @highcharts/react/Stock before importing anything that uses it
vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(() => <div data-testid="mock-stockchart" />)
}));

// Use vi.hoisted to create mock function before vi.mock is hoisted
const {mockUseIqeScoreMock} = vi.hoisted(() => ({
  mockUseIqeScoreMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/IqeScore/useIqeScoreMock', () => ({
  useIqeScoreMock: mockUseIqeScoreMock
}));

import IqeScore from '../pages/tailHistory/charts/IqeScore/IqeScore';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

const mockSeries: any[] = [
  {type: 'line', name: 'iQe Score', data: [[1000, 50]], color: '#724AE8'}
];

describe('IqeScore (CHART-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart title "iQe Score" when data is available', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: mockSeries,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<IqeScore {...defaultProps} />);
    expect(screen.getByText('iQe Score')).toBeInTheDocument();
    expect(screen.getByTestId('mock-stockchart')).toBeInTheDocument();
  });

  it('renders MUI Skeleton (no stockchart) when isLoading=true', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<IqeScore {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeNull();
  });

  it('renders "No data available for this period." when isEmpty=true', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<IqeScore {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders "Failed to load data." when error is non-null', () => {
    mockUseIqeScoreMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<IqeScore {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
