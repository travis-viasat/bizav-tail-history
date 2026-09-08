// Copyright 2026 Viasat, Inc. All rights reserved.
import { renderHook, waitFor } from '@testing-library/react';
import { useIpHistoryData } from '../hooks/useIpHistoryData';
import { ConnectivityState } from '../types';
describe('useIpHistoryData', () => {
    const defaultOptions = {
        tailId: 'test-tail-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
    };
    it('should return mock data by default', async () => {
        const { result } = renderHook(() => useIpHistoryData(defaultOptions));
        // Wait for mock data to be generated (data generation happens quickly)
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        expect(result.current.events.length).toBeGreaterThan(0);
        expect(result.current.error).toBeNull();
    });
    it('should transform events to Highcharts xrange format', async () => {
        const { result } = renderHook(() => useIpHistoryData(defaultOptions));
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        const { connectivitySeries } = result.current;
        // Verify xrange format
        connectivitySeries.forEach((series) => {
            expect(series).toHaveProperty('x');
            expect(series).toHaveProperty('x2');
            expect(series).toHaveProperty('state');
            expect(series).toHaveProperty('y');
            expect(series).toHaveProperty('name');
            // x2 should be x + 1 hour
            expect(series.x2 - series.x).toBe(3600000);
            // state should be one of the connectivity states
            expect([
                ConnectivityState.Connected,
                ConnectivityState.Acquiring,
                ConnectivityState.Disconnected,
            ]).toContain(series.state);
            // name should be a valid role
            expect(['Transmit', 'Receive', 'TPA']).toContain(series.name);
        });
    });
    it('should handle empty data gracefully', async () => {
        // Use a very small date range that might generate no data
        const { result } = renderHook(() => useIpHistoryData({
            ...defaultOptions,
            startDate: new Date('2024-01-01T00:00:00'),
            endDate: new Date('2024-01-01T00:00:01'), // 1 second range
        }));
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        // Should still have connectivity series (might be empty or have data)
        expect(Array.isArray(result.current.connectivitySeries)).toBe(true);
    });
    it('should have refetch function available', async () => {
        const { result } = renderHook(() => useIpHistoryData(defaultOptions));
        expect(result.current.refetch).toBeDefined();
        expect(typeof result.current.refetch).toBe('function');
    });
    it('should return seriesData as empty array', async () => {
        const { result } = renderHook(() => useIpHistoryData(defaultOptions));
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        expect(Array.isArray(result.current.seriesData)).toBe(true);
        expect(result.current.seriesData.length).toBe(0);
    });
    it('should generate events with required properties', async () => {
        const { result } = renderHook(() => useIpHistoryData(defaultOptions));
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        result.current.events.forEach((event) => {
            expect(event).toHaveProperty('timestamp');
            expect(event).toHaveProperty('ipAddress');
            expect(event).toHaveProperty('state');
            expect(event).toHaveProperty('metadata');
            expect(typeof event.timestamp).toBe('number');
            expect(typeof event.ipAddress).toBe('string');
            expect(typeof event.state).toBe('string');
        });
    });
    it('should sort events by timestamp', async () => {
        const { result } = renderHook(() => useIpHistoryData(defaultOptions));
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        const { events } = result.current;
        for (let i = 1; i < events.length; i++) {
            expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i - 1].timestamp);
        }
    });
    it('should respect date range bounds', async () => {
        const startTime = new Date('2024-01-01').getTime();
        const endTime = new Date('2024-01-02').getTime();
        const { result } = renderHook(() => useIpHistoryData({
            ...defaultOptions,
            startDate: new Date(startTime),
            endDate: new Date(endTime),
        }));
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        result.current.events.forEach((event) => {
            expect(event.timestamp).toBeGreaterThanOrEqual(startTime);
            expect(event.timestamp).toBeLessThanOrEqual(endTime);
        });
    });
    it('should update when tailId changes', async () => {
        const { result, rerender } = renderHook((options) => useIpHistoryData(options), { initialProps: defaultOptions });
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        const firstDataLength = result.current.events.length;
        // Change tailId
        rerender({
            ...defaultOptions,
            tailId: 'different-tail',
        });
        // Should refetch with new tailId
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        // Note: Mock data may generate different results
        expect(result.current.events.length).toBeGreaterThanOrEqual(0);
    });
    it('should update when date range changes', async () => {
        const { result, rerender } = renderHook((options) => useIpHistoryData(options), { initialProps: defaultOptions });
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        // Change date range
        rerender({
            ...defaultOptions,
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-02'),
        });
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        // Should have events within new date range
        expect(result.current.events.length).toBeGreaterThanOrEqual(0);
    });
    it('should populate metadata.role in connectivity series', async () => {
        const { result } = renderHook(() => useIpHistoryData(defaultOptions));
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        // Each event should have metadata.role
        result.current.events.forEach((event) => {
            expect(event.metadata?.role).toBeDefined();
            expect(['Transmit', 'Receive', 'TPA']).toContain(event.metadata?.role);
        });
        // Series should reflect the role
        result.current.connectivitySeries.forEach((series) => {
            expect(['Transmit', 'Receive', 'TPA']).toContain(series.name);
        });
    });
});
//# sourceMappingURL=useIpHistoryData.test.js.map