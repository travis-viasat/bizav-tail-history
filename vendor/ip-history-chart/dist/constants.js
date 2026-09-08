// Copyright 2026 Viasat, Inc. All rights reserved.
/**
 * Role color mappings — Beam data-viz categorical palette (light theme)
 */
export const ROLE_COLORS = {
    Transmit: '#592fda', // Beam categorical-1 violet
    Receive:  '#cf3fac', // Beam categorical-2 pink
    TPA:      '#0095e0', // Beam categorical-3 blue
};
/**
 * List of valid IP roles
 */
export const ROLES = ['Transmit', 'Receive', 'TPA'];
/**
 * Default chart height in pixels
 */
export const CHART_HEIGHT = 200;
/**
 * Default chart theme
 */
export const DEFAULT_THEME = 'light';
/**
 * Base Highcharts configuration for x-range chart
 */
export const CHART_CONFIG = {
    chart: {
        type: 'xrange',
        marginLeft: 120,
        spacingRight: 20,
        spacingBottom: 5,
        zooming: {
            type: 'x',
            resetButton: { theme: { display: 'none' } },
        },
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
        type: 'datetime',
    },
    yAxis: {
        categories: ROLES,
        title: { text: undefined },
    },
    plotOptions: {
        xrange: {
            dataLabels: {
                enabled: false,
            },
            enableMouseTracking: true,
        },
    },
    tooltip: {
        useHTML: true,
        outside: true,
        style: { whiteSpace: 'nowrap' },
    },
};
//# sourceMappingURL=constants.js.map