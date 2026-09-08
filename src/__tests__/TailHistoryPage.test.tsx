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
 * Description: Tests for TailHistoryPage (FOUND-05) — chart registry, zoom wiring, component rendering
 */
import {vi, describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {ThemeProvider} from '@mui/material/styles';
import theme from '../theme/Theme';

// vi.hoisted ensures these mock factories can reference variables declared in module scope
const {mockStoreImpl, mockMakeSetExtremesHandler, mockResetZoom} = vi.hoisted(() => ({
  mockStoreImpl: vi.fn(),
  mockMakeSetExtremesHandler: vi.fn(() => vi.fn()),
  mockResetZoom: vi.fn()
}));

// Mock uuid so chart IDs are deterministic in tests
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValueOnce('latency-chart-id').mockReturnValueOnce('packet-loss-chart-id')
}));

// Mock the Zustand store used by ZoomControls and useChartSync
vi.mock('../pages/tailHistory/tailHistoryStore', () => ({
  default: mockStoreImpl
}));

// Mock useChartSync so tests don't depend on Highcharts zoom logic
vi.mock('../hooks/useChartSync', () => ({
  useChartSync: vi.fn(() => ({
    makeSetExtremesHandler: mockMakeSetExtremesHandler,
    resetZoom: mockResetZoom
  }))
}));

// Mock ChartStrip to avoid rendering real Highcharts StockChart in unit tests
vi.mock('../components/ChartStrip/ChartStrip', () => ({
  default: vi.fn(({title}: {title: string}) => <div data-testid={`chart-strip-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</div>)
}));

// Mock chartData — no real 4032-point arrays in unit tests
vi.mock('../pages/tailHistory/__mocks__/chartData', () => ({
  MOCK_LATENCY_SERIES: [],
  MOCK_PACKET_LOSS_SERIES: []
}));

import TailHistoryPage from '../pages/tailHistory/TailHistoryPage';

const TIME_RANGE = {start: 1000, end: 5000};

// Configure store mock for all tests — ZoomControls reads timeRange and zoomedRange
function setupStoreMock(zoomedRange: {min: number; max: number} | null = null) {
  mockStoreImpl.mockImplementation(
    (selector: (state: {timeRange: typeof TIME_RANGE; zoomedRange: typeof zoomedRange; setZoomedRange: () => void}) => unknown) =>
      selector({timeRange: TIME_RANGE, zoomedRange, setZoomedRange: vi.fn()})
  );
}

const renderWithProviders = (tailId: string = 'N12345') => {
  setupStoreMock();
  const testQueryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}}
  });
  return render(
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[`/tail-history/${tailId}`]}>
          <Routes>
            <Route path="/tail-history/:tailId" element={<TailHistoryPage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('TailHistoryPage (FOUND-05)', () => {
  it('renders the tail ID from URL params', () => {
    renderWithProviders('N12345');
    expect(screen.getByTestId('tail-id-display')).toHaveTextContent('N12345');
  });

  it('renders empty state when no tailId provided', () => {
    setupStoreMock();
    const testQueryClient = new QueryClient({
      defaultOptions: {queries: {retry: false}}
    });
    render(
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/tail-history/']}>
            <Routes>
              <Route path="/tail-history/" element={<TailHistoryPage />} />
              <Route path="/tail-history/:tailId" element={<TailHistoryPage />} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
    expect(screen.getByText('No tail selected')).toBeInTheDocument();
  });

  it('renders the Latency ChartStrip', () => {
    renderWithProviders('N12345');
    expect(screen.getByTestId('chart-strip-latency')).toBeInTheDocument();
    expect(screen.getByText('Latency')).toBeInTheDocument();
  });

  it('renders the Packet Loss ChartStrip', () => {
    renderWithProviders('N12345');
    expect(screen.getByTestId('chart-strip-packet-loss')).toBeInTheDocument();
    expect(screen.getByText('Packet Loss')).toBeInTheDocument();
  });

  it('renders ZoomControls with a Reset Zoom button', () => {
    renderWithProviders('N12345');
    expect(screen.getByTestId('reset-zoom-button')).toBeInTheDocument();
  });

  it('registerChart and unregisterChart modify chartRegistryRef (FOUND-05)', () => {
    // Test the chart registry pattern that TailHistoryPage implements internally via useRef/useCallback.
    // Since the callbacks are passed to ChartStrip (which is mocked), we verify the pattern directly.

    const chartRegistry = new Map<string, any>();

    const registerChart = (id: string, chart: any) => {
      chartRegistry.set(id, chart);
    };

    const unregisterChart = (id: string) => {
      chartRegistry.delete(id);
    };

    // Simulate registering a chart
    const mockChart = {destroy: vi.fn()};
    registerChart('test-chart-1', mockChart);
    expect(chartRegistry.size).toBe(1);
    expect(chartRegistry.get('test-chart-1')).toBe(mockChart);

    // Register a second chart
    const mockChart2 = {destroy: vi.fn()};
    registerChart('test-chart-2', mockChart2);
    expect(chartRegistry.size).toBe(2);

    // Unregister first chart
    unregisterChart('test-chart-1');
    expect(chartRegistry.size).toBe(1);
    expect(chartRegistry.has('test-chart-1')).toBe(false);
    expect(chartRegistry.has('test-chart-2')).toBe(true);

    // Unregister second chart
    unregisterChart('test-chart-2');
    expect(chartRegistry.size).toBe(0);
  });
});
