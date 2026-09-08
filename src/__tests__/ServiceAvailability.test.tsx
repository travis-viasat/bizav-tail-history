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
 * Description: Tests for ServiceAvailability chart wrapper (CHART-03)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(() => <div data-testid="mock-stockchart" />)
}));

vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

const {mockUseServiceAvailabilityMock} = vi.hoisted(() => ({
  mockUseServiceAvailabilityMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/ServiceAvailability/useServiceAvailabilityMock', () => ({
  useServiceAvailabilityMock: mockUseServiceAvailabilityMock
}));

import ServiceAvailability from '../pages/tailHistory/charts/ServiceAvailability/ServiceAvailability';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

const mockSeries: any[] = [
  {type: 'line', name: 'Service Availability %', data: [[1000, 95]], color: '#724AE8'},
  {type: 'line', name: 'CIR Downstream Sat %', data: [[1000, 80]], color: '#185C87'},
  {type: 'line', name: 'CIR Upstream Sat %', data: [[1000, 75]], color: '#E73737'}
];

describe('ServiceAvailability (CHART-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart title "Service Availability & CIR Satisfaction" when data is available', () => {
    mockUseServiceAvailabilityMock.mockReturnValue({
      series: mockSeries,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<ServiceAvailability {...defaultProps} />);
    expect(screen.getByText('Service Availability & CIR Satisfaction')).toBeInTheDocument();
    expect(screen.getByTestId('mock-stockchart')).toBeInTheDocument();
  });

  it('renders MUI Skeleton (no stockchart) when isLoading=true', () => {
    mockUseServiceAvailabilityMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<ServiceAvailability {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeNull();
  });

  it('renders "No data available for this period." when isEmpty=true', () => {
    mockUseServiceAvailabilityMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<ServiceAvailability {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders "Failed to load data." when error is non-null', () => {
    mockUseServiceAvailabilityMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<ServiceAvailability {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
