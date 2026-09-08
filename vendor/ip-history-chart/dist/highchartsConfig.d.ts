import * as Highcharts from 'highcharts/highstock';
import type { ConnectivityEvent } from './types';
/**
 * Date range for chart axis configuration
 */
export interface DateRange {
    start: number;
    end: number;
}
/**
 * Generates Highcharts options for the IP History x-range chart
 *
 * @param events - Array of connectivity events to display
 * @param dateRange - Date range for axis bounds
 * @returns Highcharts.Options configured for x-range chart
 */
export declare function generateHighchartsOptions(events: ConnectivityEvent[], dateRange: DateRange): Highcharts.Options;
//# sourceMappingURL=highchartsConfig.d.ts.map