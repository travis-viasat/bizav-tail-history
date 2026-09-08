// Copyright 2026 Viasat, Inc. All rights reserved.
import { CHART_CONFIG, ROLE_COLORS, ROLES } from './constants';
/**
 * Generates Highcharts options for the IP History x-range chart
 *
 * @param events - Array of connectivity events to display
 * @param dateRange - Date range for axis bounds
 * @returns Highcharts.Options configured for x-range chart
 */
export function generateHighchartsOptions(events, dateRange) {
    const fmtDate = (ts) => {
        const d = new Date(ts);
        return d.toUTCString().replace(/:\d\d GMT$/, ' UTC');
    };
    return {
        ...CHART_CONFIG,
        xAxis: {
            ...CHART_CONFIG.xAxis,
            min: dateRange.start,
            max: dateRange.end,
        },
        tooltip: {
            ...CHART_CONFIG.tooltip,
            formatter() {
                const p = this.point;
                return `IP Role: <b>${p.role ?? p.name ?? ''}</b><br/>` +
                    `IP: <b>${p.ipAddress ?? '—'}</b><br/>` +
                    `Start: <b>${fmtDate(p.x)}</b><br/>` +
                    `End: <b>${fmtDate(p.x2)}</b>`;
            },
            positioner(width, height, point) {
                const chart = this.chart;
                let x = (point.plotX ?? 0) + chart.plotLeft - width / 2;
                const y = Math.max(4, (point.plotY ?? 0) + chart.plotTop - height - 10);
                x = Math.max(chart.plotLeft, Math.min(x, chart.plotLeft + chart.plotWidth - width));
                return { x, y };
            },
        },
        series: [
            {
                name: 'IP History',
                type: 'xrange',
                data: events.map((event) => ({
                    x: event.x,
                    x2: event.x2,
                    y: ROLES.indexOf(event.name),
                    color: ROLE_COLORS[event.name],
                    ipAddress: event.ipAddress,
                    role: event.name,
                })),
            },
        ],
    };
}
//# sourceMappingURL=highchartsConfig.js.map