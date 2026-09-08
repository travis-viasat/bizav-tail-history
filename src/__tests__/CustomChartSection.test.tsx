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
 * Description: Tests for CustomChartSection component (CUSTOM-03 + CUSTOM-04)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';

// Mock Highcharts to prevent jsdom canvas errors
vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(({options}: {options: {chart?: {events?: {load?: Function}}}}) => {
    // Invoke chart.events.load with a minimal chart mock so registerChart is called
    if (options?.chart?.events?.load) {
      const mockChart = {xAxis: [{setExtremes: vi.fn()}]};
      options.chart.events.load.call(mockChart);
    }
    return <div data-testid="mock-stock-chart" />;
  })
}));
vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

// Mock useTailHistoryStore — returns controlled state per test
vi.mock('../pages/tailHistory/tailHistoryStore', () => ({
  default: vi.fn()
}));

import useTailHistoryStore from '../pages/tailHistory/tailHistoryStore';
import {CustomChartSection} from '../pages/tailHistory/CustomChartSection';
import {METRIC_CATALOG} from '../catalog/metricCatalog';

const mockUseTailHistoryStore = vi.mocked(useTailHistoryStore);

const testChart = {id: 'test-1', metricIds: ['latency'], chartType: 'line' as const};
const testChart2 = {id: 'test-2', metricIds: ['upstream_cir'], chartType: 'area' as const};

const registerChartSpy = vi.fn();
const unregisterChartSpy = vi.fn();
const makeSetExtremesHandler = vi.fn(() => vi.fn());
const removeCustomChartSpy = vi.fn();
const reorderCustomChartsSpy = vi.fn();

// Helper to configure store mock for a given state
function setupStoreMock(customCharts: typeof testChart[]) {
  mockUseTailHistoryStore.mockImplementation((selector: Function) => {
    const state = {
      customCharts,
      removeCustomChart: removeCustomChartSpy,
      reorderCustomCharts: reorderCustomChartsSpy
    };
    return selector(state);
  });
}

const defaultProps = {
  registerChart: registerChartSpy,
  unregisterChart: unregisterChartSpy,
  makeSetExtremesHandler
};

describe('CustomChartSection (CUSTOM-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a new chart strip after metric is added via store', () => {
    setupStoreMock([testChart]);
    render(<CustomChartSection {...defaultProps} />);
    // The chart strip for 'latency' should be in the DOM
    // METRIC_CATALOG resolves 'latency' → 'Latency'
    const latencyMetric = METRIC_CATALOG.find(m => m.key === 'latency')!;
    // Title appears multiple times (header + ChartStrip) — use getAllByText
    const titleElements = screen.getAllByText(latencyMetric.label);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it('custom chart strip shows chart title matching metric name', () => {
    setupStoreMock([testChart]);
    render(<CustomChartSection {...defaultProps} />);
    // The chart title should match the metric label from METRIC_CATALOG
    const metricDef = METRIC_CATALOG.find(m => m.key === testChart.metricIds[0])!;
    const titleElements = screen.getAllByText(metricDef.label);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it('custom chart registers with chart registry on mount', () => {
    setupStoreMock([testChart]);
    render(<CustomChartSection {...defaultProps} />);
    // ChartStrip calls registerChart via chart.events.load — our StockChart mock invokes it
    expect(registerChartSpy).toHaveBeenCalledWith(testChart.id, expect.any(Object));
  });
});

describe('CustomChartSection (CUSTOM-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('remove button is visible on each custom chart strip', () => {
    setupStoreMock([testChart]);
    render(<CustomChartSection {...defaultProps} />);
    // Each strip has a RemoveButton with aria-label="remove chart"
    const removeButton = screen.getByRole('button', {name: /remove chart/i});
    expect(removeButton).toBeTruthy();
  });

  it('clicking remove dispatches removeCustomChart to store', () => {
    setupStoreMock([testChart]);
    render(<CustomChartSection {...defaultProps} />);
    const removeButton = screen.getByRole('button', {name: /remove chart/i});
    fireEvent.click(removeButton);
    expect(removeCustomChartSpy).toHaveBeenCalledWith(testChart.id);
  });

  it('removed chart is no longer in the DOM', () => {
    const metricDef = METRIC_CATALOG.find(m => m.key === testChart.metricIds[0])!;
    // Set up store with the chart initially
    setupStoreMock([testChart]);
    const {rerender} = render(<CustomChartSection {...defaultProps} />);
    expect(screen.getAllByText(metricDef.label).length).toBeGreaterThan(0);

    // Re-render with empty customCharts (simulating removal dispatched to store)
    setupStoreMock([]);
    rerender(<CustomChartSection {...defaultProps} />);

    // After removal, the chart label should no longer appear (CustomChartSection returns null)
    expect(screen.queryByText(metricDef.label)).toBeNull();
  });
});
