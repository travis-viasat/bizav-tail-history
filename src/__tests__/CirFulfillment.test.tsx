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
 * Description: Tests for CirFulfillment chart wrapper (CHART-04)
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
const {mockUseCirFulfillmentMock} = vi.hoisted(() => ({
  mockUseCirFulfillmentMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/CirFulfillment/useCirFulfillmentMock', () => ({
  useCirFulfillmentMock: mockUseCirFulfillmentMock
}));

import CirFulfillment from '../pages/tailHistory/charts/CirFulfillment/CirFulfillment';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

const mockSeries: any[] = [
  {type: 'line', name: 'Downstream Actual (Mbps)', data: [[1000, 50]], color: '#724AE8'},
  {type: 'line', name: 'Downstream Committed (Mbps)', data: [[1000, 40]], color: '#D4CFE1'},
  {type: 'line', name: 'Upstream Actual (Mbps)', data: [[1000, 10]], color: '#185C87'},
  {type: 'line', name: 'Upstream Committed (Mbps)', data: [[1000, 8]], color: '#DBF2FA'}
];

describe('CirFulfillment (CHART-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart title "CIR Fulfillment" when data is available', () => {
    mockUseCirFulfillmentMock.mockReturnValue({
      series: mockSeries,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<CirFulfillment {...defaultProps} />);
    expect(screen.getByText('CIR Fulfillment')).toBeInTheDocument();
    expect(screen.getByTestId('mock-stockchart')).toBeInTheDocument();
  });

  it('renders MUI Skeleton (no stockchart) when isLoading=true', () => {
    mockUseCirFulfillmentMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<CirFulfillment {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeNull();
  });

  it('renders "No data available for this period." when isEmpty=true', () => {
    mockUseCirFulfillmentMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<CirFulfillment {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders "Failed to load data." when error is non-null', () => {
    mockUseCirFulfillmentMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<CirFulfillment {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
