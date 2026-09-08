/***
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * The information in this software is subject to change without notice and
 * should not be construed as a commitment by Viasat, Inc.
 *
 * Viasat Proprietary
 * The Proprietary Information provided herein is proprietary to Viasat and
 * must be protected from further distribution and use. Disclosure to others,
 * use or copying without express written authorization of Viasat, is strictly
 * prohibited.
 *
 * Description: Mock hook for IP History chart data
 */
import type {IpHistoryEvent} from '@viasat/ip-history-chart';
import {ConnectivityState} from '@viasat/ip-history-chart';

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const NOW = Date.now();
const START = NOW - FOURTEEN_DAYS_MS;

// Three IPs from original spec — partially masked per display convention
const IPS = {
  transmit: 'xx.xxx.18.173',
  receive: 'xx.xxx.18.196',
  tpa: 'xx.xxx.16.19'
} as const;

const ROLES = ['Transmit', 'Receive', 'TPA'] as const;
const IP_VALUES = [IPS.transmit, IPS.receive, IPS.tpa] as const;

const STATES: ConnectivityState[] = [
  ConnectivityState.Connected,
  ConnectivityState.Acquiring,
  ConnectivityState.Disconnected
];

/**
 * Deterministic LCG — Park-Miller parameters for reproducibility
 */
function lcg(seed: number): number {
  return (seed * 16807) % 2147483647;
}

/**
 * Generates deterministic mock IP history events spanning the last 14 days.
 * Only ONE role is active per time block — roles are mutually exclusive so the
 * chart shows non-overlapping bars (TPA active → Receive/Transmit rows blank
 * for the same period, and vice-versa).
 */
export function generateMockIpHistoryEvents(): IpHistoryEvent[] {
  const events: IpHistoryEvent[] = [];

  let s = 42;
  let stateIdx = 0;
  let cursor = START;

  while (cursor < NOW) {
    s = lcg(s);
    const roleIdx = s % ROLES.length;
    const role    = ROLES[roleIdx];

    s = lcg(s);
    if (s % 4 === 0) stateIdx = (stateIdx + 1) % STATES.length;

    // Duration: 1–10 hours, weighted so short durations appear more often
    s = lcg(s);
    const hours = 1 + (s % 10);
    const durationMs = hours * 60 * 60 * 1000;
    const blockEnd = Math.min(cursor + durationMs, NOW);

    events.push({
      timestamp: cursor,
      ipAddress: IP_VALUES[roleIdx],
      state: STATES[stateIdx],
      signalStrength: STATES[stateIdx] === ConnectivityState.Connected ? 70 + (s % 30) : 0,
      metadata: {role, endTimestamp: blockEnd}
    });

    cursor = blockEnd;
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

export interface IpHistoryMockResult {
  events: IpHistoryEvent[];
  isLoading: boolean;
  error: string | null;
}

export function useIpHistoryMock(): IpHistoryMockResult {
  return {
    events: generateMockIpHistoryEvents(),
    isLoading: false,
    error: null
  };
}
