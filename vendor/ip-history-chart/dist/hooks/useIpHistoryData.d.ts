import type { UseIpHistoryDataOptions, UseIpHistoryDataReturn } from '../types';
/**
 * Hook for fetching and processing IP history data
 *
 * Supports both mock and API data sources. Handles loading state, errors,
 * and transforms raw events into Highcharts x-range format.
 *
 * @param options - Configuration options including tailId, date range, and data source
 * @returns Object containing events, connectivity series, series data, loading state, and error
 */
export declare function useIpHistoryData(options: UseIpHistoryDataOptions): UseIpHistoryDataReturn;
//# sourceMappingURL=useIpHistoryData.d.ts.map