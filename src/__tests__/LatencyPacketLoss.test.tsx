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
 * Description: Tests for LatencyPacketLoss chart wrapper (CHART-06)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(() => <div data-testid="mock-stockchart" />)
}));

vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

const {mockUseLatencyPacketLossMock} = vi.hoisted(() => ({
  mockUseLatencyPacketLossMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/LatencyPacketLoss/useLatencyPacketLossMock', () => ({
  useLatencyPacketLossMock: mockUseLatencyPacketLossMock
}));

import LatencyPacketLoss from '../pages/tailHistory/charts/LatencyPacketLoss/LatencyPacketLoss';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

const mockSeries: any[] = [
  {type: 'line', name: 'Avg Latency (ms)', data: [[1000, 120]], color: '#724AE8', yAxis: 0},
  {type: 'line', name: 'Min Latency (ms)', data: [[1000, 80]], color: '#9FAFBC', yAxis: 0},
  {type: 'line', name: 'Max Latency (ms)', data: [[1000, 250]], color: '#465967', yAxis: 0},
  {type: 'line', name: 'Packet Loss %', data: [[1000, 2]], color: '#E73737', yAxis: 1}
];

describe('LatencyPacketLoss (CHART-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart title "Latency & Packet Loss" when data is available', () => {
    mockUseLatencyPacketLossMock.mockReturnValue({
      series: mockSeries,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<LatencyPacketLoss {...defaultProps} />);
    expect(screen.getByText('Latency & Packet Loss')).toBeInTheDocument();
    expect(screen.getByTestId('mock-stockchart')).toBeInTheDocument();
  });

  it('renders MUI Skeleton (no stockchart) when isLoading=true', () => {
    mockUseLatencyPacketLossMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<LatencyPacketLoss {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeNull();
  });

  it('renders "No data available for this period." when isEmpty=true', () => {
    mockUseLatencyPacketLossMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<LatencyPacketLoss {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders "Failed to load data." when error is non-null', () => {
    mockUseLatencyPacketLossMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<LatencyPacketLoss {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
