// Copyright 2026 Viasat, Inc. All rights reserved.
import { useEffect, useRef } from 'react';
/**
 * Hook for managing chart registration and unregistration.
 * Registers a chart instance with a parent sync system and handles cleanup.
 *
 * @param chart - The Highcharts chart instance, or null if not yet initialized
 * @param registerChart - Optional callback to register the chart with a parent component
 * @param unregisterChart - Optional callback to unregister the chart when unmounting
 *
 * @example
 * const chartRef = useRef<Highcharts.Chart | null>(null);
 *
 * useChartRegistration(
 *   chartRef.current,
 *   (id, chart) => parentStore.register(id, chart),
 *   (id) => parentStore.unregister(id)
 * );
 */
export function useChartRegistration(chart, registerChart, unregisterChart) {
    const chartIdRef = useRef(null);
    useEffect(() => {
        // Early return if chart or registerChart callback are not provided
        if (!chart || !registerChart) {
            return;
        }
        // Generate a unique chart ID (use native crypto.randomUUID for modern environments)
        const chartId = crypto.randomUUID();
        chartIdRef.current = chartId;
        // Register the chart with the parent component
        registerChart(chartId, chart);
        // Cleanup function: unregister the chart when component unmounts or dependencies change
        return () => {
            if (chartIdRef.current && unregisterChart) {
                unregisterChart(chartIdRef.current);
            }
        };
    }, [chart, registerChart, unregisterChart]);
}
//# sourceMappingURL=useChartRegistration.js.map