import { type IpHistoryEvent } from './types';
/**
 * Pool of obfuscated IP addresses for mock data
 */
export declare const IP_POOL: string[];
/**
 * Date range for mock data generation
 */
export interface DateRange {
    start: number;
    end: number;
}
/**
 * Generates mock IP history events for a given date range
 *
 * Generates 3-5 IP changes per role, distributed evenly over the date range
 * with some variance (0.8 to 1.2 multiplier)
 *
 * @param dateRange - Start and end timestamps in milliseconds
 * @returns Array of IpHistoryEvent objects
 */
export declare function generateMockIpHistory(dateRange: DateRange): IpHistoryEvent[];
//# sourceMappingURL=mockData.d.ts.map