/**
 * Connectivity state enum
 */
export declare enum ConnectivityState {
    Disconnected = "disconnected",
    Acquiring = "acquiring",
    Connected = "connected"
}
/**
 * Represents a single connectivity event in the IP history
 */
export interface IpHistoryEvent {
    /** Unix timestamp (milliseconds) */
    timestamp: number;
    /** IP address associated with this event */
    ipAddress: string;
    /** Connectivity state at this timestamp */
    state: ConnectivityState;
    /** Signal strength (0-100), if available */
    signalStrength?: number;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Represents a single data point for a chart series
 */
export interface SeriesData {
    /** X-axis value (timestamp in milliseconds) */
    x: number;
    /** Y-axis value (varies by series type) */
    y: number | null;
    /** Optional category label */
    category?: string;
    /** Optional color override */
    color?: string;
}
/**
 * Represents a connectivity event transition (used in series data)
 */
export interface ConnectivityEvent {
    /** Start timestamp */
    x: number;
    /** End timestamp */
    x2: number;
    /** Connectivity state */
    state: ConnectivityState;
    /** Y position (for stacking) */
    y?: number;
    /** Display name */
    name?: string;
    /** Color based on state */
    color?: string;
}
/**
 * Options for the useIpHistoryData hook
 */
export interface UseIpHistoryDataOptions {
    /** Tail ID to fetch history for */
    tailId: string;
    /** Start date (ISO string or Date) */
    startDate: string | Date;
    /** End date (ISO string or Date) */
    endDate: string | Date;
    /** Enable automatic refetch on interval (ms) */
    refetchInterval?: number;
    /** Custom query key suffix for React Query */
    queryKeyPrefix?: string;
}
/**
 * Return value of the useIpHistoryData hook
 */
export interface UseIpHistoryDataReturn {
    /** Processed IP history events */
    events: IpHistoryEvent[];
    /** Connectivity transitions (for x-range chart) */
    connectivitySeries: ConnectivityEvent[];
    /** Raw series data (for other chart types) */
    seriesData: SeriesData[];
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
    /** Manual refetch function */
    refetch: () => Promise<void>;
}
/**
 * Props for the IpHistoryChart component
 */
export interface IpHistoryChartProps {
    /** Tail ID */
    tailId: string;
    /** Start date for history range */
    startDate: string | Date;
    /** End date for history range */
    endDate: string | Date;
    /** Chart height in pixels (default: 400) */
    height?: number;
    /** Chart title */
    title?: string;
    /** Enable x-range (event timeline) series (default: true) */
    showEventTimeline?: boolean;
    /** Enable signal strength series (default: true) */
    showSignalStrength?: boolean;
    /** Custom className for root container */
    className?: string;
    /** Callback when date range is changed */
    onDateRangeChange?: (startDate: Date, endDate: Date) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Refetch interval in milliseconds */
    refetchInterval?: number;
}
//# sourceMappingURL=types.d.ts.map