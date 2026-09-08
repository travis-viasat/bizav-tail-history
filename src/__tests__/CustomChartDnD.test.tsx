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
 * Description: Tests for CustomChartDnD drag-and-drop reordering (CUSTOM-05)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';

// Mock Highcharts to prevent jsdom canvas errors
vi.mock('@highcharts/react/Stock', () => ({
  StockChart: vi.fn(({options}: {options: {chart?: {events?: {load?: Function}}}}) => {
    if (options?.chart?.events?.load) {
      const mockChart = {xAxis: [{setExtremes: vi.fn()}]};
      options.chart.events.load.call(mockChart);
    }
    return <div data-testid="mock-stock-chart" />;
  })
}));
vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

// Mock useTailHistoryStore
vi.mock('../pages/tailHistory/tailHistoryStore', () => ({
  default: vi.fn()
}));

// Mock @dnd-kit/core to intercept DndContext and expose onDragEnd
vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core');
  return {
    ...(actual as object),
    DndContext: vi.fn(({children, onDragEnd}: {children: React.ReactNode; onDragEnd: Function}) => {
      // Expose the onDragEnd handler via a test button
      return (
        <div data-testid="dnd-context">
          <button
            data-testid="trigger-drag-end"
            onClick={() =>
              onDragEnd({
                active: {id: 'test-1'},
                over: {id: 'test-2'}
              })
            }
          >
            Trigger DragEnd
          </button>
          {children}
        </div>
      );
    })
  };
});

import useTailHistoryStore from '../pages/tailHistory/tailHistoryStore';
import {CustomChartSection} from '../pages/tailHistory/CustomChartSection';

const mockUseTailHistoryStore = vi.mocked(useTailHistoryStore);

const chart1 = {id: 'test-1', metricIds: ['latency'], chartType: 'line' as const};
const chart2 = {id: 'test-2', metricIds: ['upstream_cir'], chartType: 'area' as const};

const registerChartSpy = vi.fn();
const unregisterChartSpy = vi.fn();
const makeSetExtremesHandler = vi.fn(() => vi.fn());
const removeCustomChartSpy = vi.fn();
const reorderCustomChartsSpy = vi.fn();

function setupStoreMock(customCharts: typeof chart1[]) {
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

describe('CustomChartDnD (CUSTOM-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SortableContext wrapper around custom chart list', () => {
    setupStoreMock([chart1, chart2]);
    render(<CustomChartSection {...defaultProps} />);
    // DndContext mock renders a div[data-testid="dnd-context"] wrapping the list
    expect(screen.getByTestId('dnd-context')).toBeTruthy();
    // Both chart titles should be inside the context (title may appear multiple times: header + ChartStrip)
    expect(screen.getAllByText('Latency').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Upstream CIR').length).toBeGreaterThan(0);
  });

  it('dispatches reorderCustomCharts to store after drag end', () => {
    setupStoreMock([chart1, chart2]);
    render(<CustomChartSection {...defaultProps} />);

    // Trigger our mock DragEnd via the test button
    const triggerButton = screen.getByTestId('trigger-drag-end');
    triggerButton.click();

    // reorderCustomCharts should be called with the arrayMove result
    // active.id='test-1' (index 0), over.id='test-2' (index 1) → arrayMove → [chart2, chart1]
    expect(reorderCustomChartsSpy).toHaveBeenCalledOnce();
    const calledWith = reorderCustomChartsSpy.mock.calls[0][0];
    expect(calledWith[0].id).toBe('test-2');
    expect(calledWith[1].id).toBe('test-1');
  });
});
