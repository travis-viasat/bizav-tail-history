import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Copyright 2026 Viasat, Inc. All rights reserved.
import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import HighCharts from 'highcharts/highstock';
import { useIpHistoryData } from './hooks/useIpHistoryData';
import { useChartRegistration } from './useChartRegistration';
import { generateHighchartsOptions } from './highchartsConfig';
import { CHART_HEIGHT } from './constants';
/**
 * Styled container for the chart
 */
const ChartContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: 'none',
}));
/**
 * Styled chart title
 */
const ChartTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    marginBottom: theme.spacing(2),
}));
/**
 * Styled error message
 */
const ErrorMessage = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: `${theme.palette.error.main}10`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.error.main,
}));
/**
 * IpHistoryChart component
 *
 * Main component that ties together data fetching, chart rendering,
 * and optional synchronization with parent zoom controls.
 */
export const IpHistoryChart = React.forwardRef(({ data, dateRange, isLoading: externalIsLoading, error: externalError, onSetExtremes, registerChart, unregisterChart, height = CHART_HEIGHT, theme: themeMode = 'light', title = 'IP History', eventMarkers, tailId, }, ref) => {
    // State
    const [currentChart, setCurrentChart] = useState(null);
    const containerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    // Forward ref
    React.useImperativeHandle(ref, () => currentChart, [currentChart]);
    // Use hook for data fetching if data not explicitly provided
    const hookResult = useIpHistoryData({
        tailId,
        startDate: dateRange.start,
        endDate: dateRange.end,
    });
    // Merge external and hook states
    const isLoading = externalIsLoading ?? hookResult.isLoading;
    const error = externalError ?? hookResult.error?.message ?? null;
    const isEmpty = externalIsLoading === false
        ? (data?.length ?? 0) === 0
        : hookResult.connectivitySeries.length === 0;
    // Use provided data or hook data
    const chartData = data
        ? data.map((event) => ({
            x: event.timestamp,
            x2: event.metadata?.endTimestamp ?? event.timestamp + 3600000,
            state: event.state,
            name: event.metadata?.role || 'Transmit',
            ipAddress: event.ipAddress,
            color: undefined,
        }))
        : hookResult.connectivitySeries;
    // Register chart with parent
    useChartRegistration(currentChart, registerChart, unregisterChart);
    // Create chart imperatively once the container div is in the DOM.
    // chartData is stored in a ref so the effect doesn't re-run on every render
    // (chartData is a new array reference each render — would cause infinite loop).
    const chartDataRef = useRef(chartData);
    chartDataRef.current = chartData;
    useEffect(() => {
        if (!containerRef.current)
            return;
        const options = generateHighchartsOptions(chartDataRef.current, {
            start: dateRange.start.getTime(),
            end: dateRange.end.getTime(),
        });
        const chart = HighCharts.chart(containerRef.current, {
            ...options,
            chart: {
                ...options.chart,
                height,
                events: {
                    selection: onSetExtremes
                        ? (event) => {
                            if (event.xAxis?.[0]) {
                                const { min, max } = event.xAxis[0];
                                onSetExtremes(min, max);
                            }
                            return undefined;
                        }
                        : undefined,
                },
            },
        });
        chartInstanceRef.current = chart;
        setCurrentChart(chart);
        return () => {
            chart.destroy();
            chartInstanceRef.current = null;
        };
        // dateRange primitives and height drive re-creation; onSetExtremes is stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange.start.getTime(), dateRange.end.getTime(), height, onSetExtremes]);
    // Render loading state
    if (isLoading) {
        return (_jsxs(ChartContainer, { children: [title && _jsx(ChartTitle, { variant: "subtitle2", children: title }), _jsx(Skeleton, { variant: "rectangular", height: height })] }));
    }
    // Render error state
    if (error) {
        return (_jsxs(ChartContainer, { children: [title && _jsx(ChartTitle, { variant: "subtitle2", children: title }), _jsx(ErrorMessage, { children: _jsxs(Typography, { variant: "body2", children: ["Error: ", error] }) })] }));
    }
    // Render empty state
    if (isEmpty) {
        return (_jsxs(ChartContainer, { children: [title && _jsx(ChartTitle, { variant: "subtitle2", children: title }), _jsx(Box, { sx: { padding: 2, textAlign: 'center', color: 'text.secondary' }, children: _jsx(Typography, { variant: "body2", children: "No IP history data available" }) })] }));
    }
    // Render chart
    return (_jsxs(ChartContainer, { children: [title && _jsx(ChartTitle, { variant: "subtitle2", children: title }), _jsx("div", { ref: containerRef })] }));
});
IpHistoryChart.displayName = 'IpHistoryChart';
//# sourceMappingURL=IpHistoryChart.js.map