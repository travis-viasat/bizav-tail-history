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
 * Description: Tests for useChartSync hook — feedback-loop guard (ZOOM-02)
 */
import {renderHook, act} from '@testing-library/react';
import {vi, describe, it, expect, beforeEach} from 'vitest';

// vi.hoisted() ensures this mock factory can reference module-scope variables.
const {mockSetZoomedRange} = vi.hoisted(() => ({
  mockSetZoomedRange: vi.fn()
}));

// Mock the Zustand store module so all tests get a controlled setZoomedRange.
vi.mock('../pages/tailHistory/tailHistoryStore', () => ({
  default: (selector: (state: {setZoomedRange: typeof mockSetZoomedRange}) => unknown) =>
    selector({setZoomedRange: mockSetZoomedRange})
}));

import {useChartSync, SYNC_TRIGGER} from '../hooks/useChartSync';

// Helper: create a minimal mock chart object that mirrors Highcharts.Chart's xAxis API
const createMockChart = () => ({
  xAxis: [{setExtremes: vi.fn()}]
});

describe('useChartSync (ZOOM-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not propagate when trigger is syncExtremes', () => {
    const chartA = createMockChart();
    const chartB = createMockChart();
    const registryRef = {current: new Map([['chart-a', chartA as any], ['chart-b', chartB as any]])};

    const {result} = renderHook(() => useChartSync(registryRef as any));

    const handler = result.current.makeSetExtremesHandler('chart-a');

    act(() => {
      handler({trigger: SYNC_TRIGGER, min: 100, max: 200} as any);
    });

    // Neither chart should receive setExtremes — guard bails out immediately
    expect(chartA.xAxis[0].setExtremes).not.toHaveBeenCalled();
    expect(chartB.xAxis[0].setExtremes).not.toHaveBeenCalled();
    // Store should not be written
    expect(mockSetZoomedRange).not.toHaveBeenCalled();
  });

  it('propagates to other charts when trigger is user zoom', () => {
    const chartA = createMockChart();
    const chartB = createMockChart();
    const registryRef = {current: new Map([['chart-a', chartA as any], ['chart-b', chartB as any]])};

    const {result} = renderHook(() => useChartSync(registryRef as any));

    const handler = result.current.makeSetExtremesHandler('chart-a');

    act(() => {
      handler({trigger: 'zoom', min: 100, max: 200} as any);
    });

    // chart-B should receive setExtremes with SYNC_TRIGGER to prevent echo
    expect(chartB.xAxis[0].setExtremes).toHaveBeenCalledWith(100, 200, true, false, {
      trigger: SYNC_TRIGGER
    });
    // chart-A (self) should NOT be called — skip self rule
    expect(chartA.xAxis[0].setExtremes).not.toHaveBeenCalled();
  });

  it('writes zoomedRange to store on user zoom', () => {
    const chartA = createMockChart();
    const registryRef = {current: new Map([['chart-a', chartA as any]])};

    const {result} = renderHook(() => useChartSync(registryRef as any));

    const handler = result.current.makeSetExtremesHandler('chart-a');

    act(() => {
      handler({trigger: 'zoom', min: 500, max: 1000} as any);
    });

    expect(mockSetZoomedRange).toHaveBeenCalledWith({min: 500, max: 1000});
  });

  it('clears zoomedRange when min/max undefined', () => {
    const chartA = createMockChart();
    const registryRef = {current: new Map([['chart-a', chartA as any]])};

    const {result} = renderHook(() => useChartSync(registryRef as any));

    const handler = result.current.makeSetExtremesHandler('chart-a');

    act(() => {
      handler({trigger: 'zoom', min: undefined, max: undefined} as any);
    });

    expect(mockSetZoomedRange).toHaveBeenCalledWith(null);
  });

  it('resetZoom calls setExtremes(undefined, undefined) on all charts', () => {
    const chartA = createMockChart();
    const chartB = createMockChart();
    const registryRef = {current: new Map([['chart-a', chartA as any], ['chart-b', chartB as any]])};

    const {result} = renderHook(() => useChartSync(registryRef as any));

    act(() => {
      result.current.resetZoom();
    });

    // Both charts get reset with undefined (NOT null — null coerces to epoch 0)
    expect(chartA.xAxis[0].setExtremes).toHaveBeenCalledWith(undefined, undefined, true, false, {
      trigger: SYNC_TRIGGER
    });
    expect(chartB.xAxis[0].setExtremes).toHaveBeenCalledWith(undefined, undefined, true, false, {
      trigger: SYNC_TRIGGER
    });
  });

  it('resetZoom sets zoomedRange to null', () => {
    const registryRef = {current: new Map()};

    const {result} = renderHook(() => useChartSync(registryRef as any));

    act(() => {
      result.current.resetZoom();
    });

    expect(mockSetZoomedRange).toHaveBeenCalledWith(null);
  });
});
