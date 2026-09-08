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
 * Description: Tests for EventsTimeline chart wrapper (CHART-01)
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
const {mockUseEventsTimelineMock} = vi.hoisted(() => ({
  mockUseEventsTimelineMock: vi.fn()
}));

vi.mock('../pages/tailHistory/charts/EventsTimeline/useEventsTimelineMock', () => ({
  useEventsTimelineMock: mockUseEventsTimelineMock
}));

import EventsTimeline from '../pages/tailHistory/charts/EventsTimeline/EventsTimeline';

const defaultProps = {
  registerChart: vi.fn(),
  unregisterChart: vi.fn(),
  onSetExtremes: vi.fn()
};

const mockSeries: any[] = [
  {type: 'xrange', name: 'Connectivity State', colorByPoint: true, data: [{x: 0, x2: 1000, y: 0}]}
];

describe('EventsTimeline (CHART-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chart title "Events Timeline" when data is available', () => {
    mockUseEventsTimelineMock.mockReturnValue({
      series: mockSeries,
      isLoading: false,
      isEmpty: false,
      error: null
    });
    render(<EventsTimeline {...defaultProps} />);
    expect(screen.getByText('Events Timeline')).toBeInTheDocument();
    expect(screen.getByTestId('mock-stockchart')).toBeInTheDocument();
  });

  it('renders MUI Skeleton (no stockchart) when isLoading=true', () => {
    mockUseEventsTimelineMock.mockReturnValue({
      series: [],
      isLoading: true,
      isEmpty: false,
      error: null
    });
    render(<EventsTimeline {...defaultProps} />);
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
    // Skeleton renders with role="presentation" or can be found via aria
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeNull();
  });

  it('renders "No data available for this period." when isEmpty=true', () => {
    mockUseEventsTimelineMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: true,
      error: null
    });
    render(<EventsTimeline {...defaultProps} />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });

  it('renders "Failed to load data." when error is non-null', () => {
    mockUseEventsTimelineMock.mockReturnValue({
      series: [],
      isLoading: false,
      isEmpty: false,
      error: 'Network error'
    });
    render(<EventsTimeline {...defaultProps} />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-stockchart')).not.toBeInTheDocument();
  });
});
