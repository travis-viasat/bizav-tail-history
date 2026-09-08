// Copyright 2026 Viasat, Inc. All rights reserved.
import { useEffect, useState, useRef } from 'react';
import { generateMockIpHistory } from '../mockData';
import { ROLES } from '../constants';
/**
 * Hook for fetching and processing IP history data
 *
 * Supports both mock and API data sources. Handles loading state, errors,
 * and transforms raw events into Highcharts x-range format.
 *
 * @param options - Configuration options including tailId, date range, and data source
 * @returns Object containing events, connectivity series, series data, loading state, and error
 */
export function useIpHistoryData(options) {
    const { tailId, startDate, endDate } = options;
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    // Normalize dates to timestamps
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    const dateRange = { start: startTimestamp, end: endTimestamp };
    // Fetch/generate data
    useEffect(() => {
        const fetchData = async () => {
            if (!isMountedRef.current)
                return;
            setIsLoading(true);
            setError(null);
            try {
                let fetchedEvents = [];
                // Generate mock data (no API data source specified yet)
                fetchedEvents = generateMockIpHistory(dateRange);
                if (!isMountedRef.current)
                    return;
                setEvents(fetchedEvents);
            }
            catch (err) {
                if (!isMountedRef.current)
                    return;
                setError(err instanceof Error ? err : new Error('Failed to fetch IP history data'));
            }
            finally {
                if (isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
        // Cleanup function
        return () => {
            isMountedRef.current = true;
        };
    }, [tailId, startTimestamp, endTimestamp, dateRange.start, dateRange.end]);
    // Transform events to Highcharts x-range format grouped by role
    const connectivitySeries = events.map((event) => {
        const role = event.metadata?.role || 'Transmit';
        const roleIndex = ROLES.indexOf(role);
        return {
            x: event.timestamp,
            x2: event.timestamp + 3600000, // 1 hour duration for visibility
            state: event.state,
            y: roleIndex,
            name: role,
            color: undefined, // Will be applied by chart
        };
    });
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    return {
        events,
        connectivitySeries,
        seriesData: [], // Placeholder for raw series data (not used for x-range chart)
        isLoading,
        error,
        refetch: async () => {
            // Manual refetch can be implemented if needed
        },
    };
}
//# sourceMappingURL=useIpHistoryData.js.map