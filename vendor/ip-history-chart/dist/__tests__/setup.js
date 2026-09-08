// Copyright 2026 Viasat, Inc. All rights reserved.
import React from 'react';
import '@testing-library/jest-dom';
// Mock Highcharts
jest.mock('highcharts', () => {
    const mockChart = {
        update: jest.fn(),
        reflow: jest.fn(),
        redraw: jest.fn(),
        destroy: jest.fn(),
        getSeries: jest.fn(() => []),
        getAxis: jest.fn(() => ({
            setExtremes: jest.fn(),
        })),
    };
    return {
        __esModule: true,
        default: {
            Chart: jest.fn(() => mockChart),
            chart: jest.fn(),
        },
    };
});
// Mock @highcharts/react
jest.mock('@highcharts/react', () => {
    const MockChart = React.forwardRef(({ options, highcharts }, ref) => {
        // Store reference to chart in ref
        React.useImperativeHandle(ref, () => ({
            getChart: () => ({
                update: jest.fn(),
                reflow: jest.fn(),
                redraw: jest.fn(),
                destroy: jest.fn(),
                getSeries: jest.fn(() => []),
                getAxis: jest.fn(() => ({
                    setExtremes: jest.fn(),
                })),
            }),
        }), []);
        return React.createElement('div', { 'data-testid': 'highcharts-chart' }, JSON.stringify(options?.chart?.type || 'chart'));
    });
    MockChart.displayName = 'MockChart';
    return {
        __esModule: true,
        Chart: MockChart,
    };
});
// Global test setup
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
//# sourceMappingURL=setup.js.map