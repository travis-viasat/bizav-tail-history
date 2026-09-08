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
 * Description: Tests for ChartStrip component — zoom enabled, chart renders (ZOOM-01)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

// Capture the last options object passed to StockChart so we can assert on it
let capturedOptions: any = null;
let capturedRegisterChart: ((id: string, chart: any) => void) | null = null;

// Create a minimal mock chart instance that the load event handler receives
const mockChartInstance = {
  xAxis: [{setExtremes: vi.fn()}],
  destroy: vi.fn()
};

// Mock @highcharts/react/Stock before importing ChartStrip
vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn((props: any) => {
    capturedOptions = props.options;
    // Simulate Highcharts calling chart.events.load with the chart instance
    if (props.options?.chart?.events?.load) {
      props.options.chart.events.load.call(mockChartInstance);
    }
    return <div data-testid="mock-stockchart" />;
  })
}));

import ChartStrip from '../components/ChartStrip/ChartStrip';

describe('ChartStrip (ZOOM-01)', () => {
  beforeEach(() => {
    capturedOptions = null;
    vi.clearAllMocks();
  });

  const defaultProps = {
    chartId: 'test-chart-id',
    title: 'Latency',
    series: [],
    registerChart: vi.fn(),
    unregisterChart: vi.fn(),
    onSetExtremes: vi.fn()
  };

  it('renders chart title', () => {
    render(<ChartStrip {...defaultProps} />);
    expect(screen.getByText('Latency')).toBeInTheDocument();
  });

  it('passes zooming.type: x in chart options', () => {
    render(<ChartStrip {...defaultProps} />);
    expect(capturedOptions?.chart?.zooming?.type).toBe('x');
  });

  it('disables navigator, scrollbar, rangeSelector', () => {
    render(<ChartStrip {...defaultProps} />);
    expect(capturedOptions?.navigator?.enabled).toBe(false);
    expect(capturedOptions?.scrollbar?.enabled).toBe(false);
    expect(capturedOptions?.rangeSelector?.enabled).toBe(false);
  });

  it('hides built-in reset zoom button', () => {
    render(<ChartStrip {...defaultProps} />);
    expect(capturedOptions?.chart?.zooming?.resetButton?.theme?.display).toBe('none');
  });

  it('calls registerChart on chart load', () => {
    const registerChart = vi.fn();
    render(<ChartStrip {...defaultProps} registerChart={registerChart} />);
    expect(registerChart).toHaveBeenCalledWith('test-chart-id', mockChartInstance);
  });

  it('calls unregisterChart on unmount', () => {
    const unregisterChart = vi.fn();
    const {unmount} = render(<ChartStrip {...defaultProps} unregisterChart={unregisterChart} />);
    unmount();
    expect(unregisterChart).toHaveBeenCalledWith('test-chart-id');
  });
});
