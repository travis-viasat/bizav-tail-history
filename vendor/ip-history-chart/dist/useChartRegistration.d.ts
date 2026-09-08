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
export declare function useChartRegistration(chart: Highcharts.Chart | null, registerChart?: (id: string, chart: Highcharts.Chart) => void, unregisterChart?: (id: string) => void): void;
//# sourceMappingURL=useChartRegistration.d.ts.map