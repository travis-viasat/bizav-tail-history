// Copyright 2026 Viasat, Inc. All rights reserved.
import { ConnectivityState } from './types';
import { ROLES } from './constants';
/**
 * Pool of obfuscated IP addresses for mock data
 */
export const IP_POOL = [
    'xx.xxx.18.173',
    'xx.xxx.18.196',
    'xx.xxx.16.19',
    'xx.xxx.20.50',
    'xx.xxx.21.100',
];
/**
 * Connectivity states for mock data
 */
const STATES = [ConnectivityState.Connected, ConnectivityState.Acquiring, ConnectivityState.Disconnected];
/**
 * Generates mock IP history events for a given date range
 *
 * Generates 3-5 IP changes per role, distributed evenly over the date range
 * with some variance (0.8 to 1.2 multiplier)
 *
 * @param dateRange - Start and end timestamps in milliseconds
 * @returns Array of IpHistoryEvent objects
 */
export function generateMockIpHistory(dateRange) {
    const events = [];
    const timeSpan = dateRange.end - dateRange.start;
    // Generate 3-5 IP changes per role
    const changesPerRole = Math.floor(Math.random() * 3) + 3; // 3-5 changes
    ROLES.forEach((role) => {
        for (let i = 0; i < changesPerRole; i++) {
            // Distribute changes evenly with variance (0.8 to 1.2 multiplier)
            const basePosition = (i / changesPerRole) * timeSpan;
            const variance = (Math.random() * 0.4 + 0.8); // 0.8 to 1.2
            const timestamp = dateRange.start + basePosition * variance;
            // Ensure timestamp stays within range
            const clampedTimestamp = Math.min(timestamp, dateRange.end);
            const event = {
                timestamp: clampedTimestamp,
                ipAddress: IP_POOL[Math.floor(Math.random() * IP_POOL.length)],
                state: STATES[Math.floor(Math.random() * STATES.length)],
                signalStrength: Math.floor(Math.random() * 100),
                metadata: {
                    role,
                },
            };
            events.push(event);
        }
    });
    // Sort events by timestamp
    return events.sort((a, b) => a.timestamp - b.timestamp);
}
//# sourceMappingURL=mockData.js.map