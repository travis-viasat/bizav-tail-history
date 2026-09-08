import React from 'react';
import HighCharts from 'highcharts/highstock';
import type { IpHistoryEvent, ConnectivityEvent } from './types';
/**
 * Props for the IpHistoryChart component
 */
export interface IpHistoryChartComponentProps {
    /** Optional explicit data to override hook */
    data?: IpHistoryEvent[];
    /** Required date range */
    dateRange: {
        start: Date;
        end: Date;
    };
    /** Manual loading state (overrides hook) */
    isLoading?: boolean;
    /** Manual error state (overrides hook) */
    error?: string | null;
    /** Callback for zoom sync */
    onSetExtremes?: (start: number, end: number) => void;
    /** Parent registration callback */
    registerChart?: (id: string, chart: HighCharts.Chart) => void;
    /** Parent unregistration callback */
    unregisterChart?: (id: string) => void;
    /** Chart height in pixels */
    height?: number;
    /** Theme variant */
    theme?: 'light' | 'dark';
    /** Chart title */
    title?: string;
    /** Event markers for connectivity states */
    eventMarkers?: ConnectivityEvent[];
    /** Tail ID for data fetching */
    tailId: string;
}
/**
 * IpHistoryChart component
 *
 * Main component that ties together data fetching, chart rendering,
 * and optional synchronization with parent zoom controls.
 */
export declare const IpHistoryChart: React.ForwardRefExoticComponent<IpHistoryChartComponentProps & React.RefAttributes<any>>;
//# sourceMappingURL=IpHistoryChart.d.ts.map