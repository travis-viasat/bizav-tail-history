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
 * Description: Tests for ChartTypePicker component (CUSTOM-02)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';

// Mock Highcharts to prevent jsdom canvas errors
vi.mock('@highcharts/react/Stock', () => ({
  StockChart: () => <div data-testid="mock-stock-chart" />
}));
vi.mock('highcharts/modules/xrange', () => ({default: vi.fn()}));

import ChartTypePicker from '../components/AddChartDrawer/ChartTypePicker';
import {METRIC_CATALOG} from '../catalog/metricCatalog';
import AddChartDrawer from '../components/AddChartDrawer/AddChartDrawer';

// upstream_cir is a numeric/throughput metric → NUMERIC = ['line', 'area', 'bar', 'scatter']
const numericMetric = METRIC_CATALOG.find(m => m.key === 'upstream_cir')!;
// connectivity_events is a boolean/event metric → BOOLEAN_EVENT = ['bar']
const eventMetric = METRIC_CATALOG.find(m => m.key === 'connectivity_events')!;

const noop = vi.fn();

describe('ChartTypePicker (CUSTOM-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows only compatible chart types for a time-series numeric metric', () => {
    render(
      <ChartTypePicker metrics={[numericMetric]} selectedType={null} onSelect={noop} />
    );
    // upstream_cir → NUMERIC → ['line', 'area', 'bar', 'scatter']
    expect(screen.getByRole('button', {name: /line/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /area/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /bar/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /scatter/i})).toBeTruthy();
  });

  it('shows only bar type for a boolean/event metric', () => {
    render(
      <ChartTypePicker metrics={[eventMetric]} selectedType={null} onSelect={noop} />
    );
    // connectivity_events → BOOLEAN_EVENT → ['bar']
    expect(screen.getByRole('button', {name: /bar/i})).toBeTruthy();
    // line, area, scatter should NOT be shown
    expect(screen.queryByRole('button', {name: /line/i})).toBeNull();
    expect(screen.queryByRole('button', {name: /area/i})).toBeNull();
    expect(screen.queryByRole('button', {name: /scatter/i})).toBeNull();
  });

  it('disables Add button until at least one metric is checked', () => {
    // Render the full AddChartDrawer to test the Add button guard
    render(<AddChartDrawer open={true} onClose={noop} onAdd={noop} />);

    // Initially no metric is checked — Add Chart button should be disabled
    const addButton = screen.getByRole('button', {name: /^add chart$/i});
    expect(addButton).toHaveProperty('disabled', true);

    // Click on a metric row to check it — click the text so the event bubbles up to ListItemButton
    fireEvent.click(screen.getByText('Latency'));

    // After checking metric, a chart type is auto-selected → Add button enabled
    const addButtonAfter = screen.getByRole('button', {name: /^add chart$/i});
    expect(addButtonAfter).toHaveProperty('disabled', false);
  });
});
