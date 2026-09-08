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
 * Description: Derives discrete connectivity event markers from the same LCG used by
 * useEventsTimelineMock. These are rendered as vertical plotLines on all line charts
 * so analysts can correlate signal drops with metric changes.
 */
import {MOCK_START, MOCK_END} from '../../__mocks__/chartData';
import {RAG_ACQUIRING, RAG_DISCONNECTED, SURFACE_GREY} from '../../../../theme/colors';
import type {ConnectivityEvent} from '../../../../components/ChartStrip/ChartStrip.types';

export function useConnectivityEventsMock(): ConnectivityEvent[] {
  const events: ConnectivityEvent[] = [];
  let cursor = MOCK_START;
  let lcg = 99;

  function next(): number {
    lcg = (lcg * 16807) % 2147483647;
    return lcg / 2147483647;
  }

  while (cursor < MOCK_END) {
    const r = next();
    let label: string | null = null;
    let color: string | null = null;
    let durationMs: number;

    if (r < 0.6) {
      durationMs = (30 + next() * 210) * 60 * 1000;
    } else if (r < 0.75) {
      label = 'Reconnecting';
      color = RAG_ACQUIRING;
      durationMs = (0.5 + next() * 4.5) * 60 * 1000;
    } else if (r < 0.88) {
      label = 'Signal Lost';
      color = RAG_DISCONNECTED;
      durationMs = (2 + next() * 18) * 60 * 1000;
    } else if (r < 0.94) {
      label = 'Net Change';
      color = SURFACE_GREY[600];
      durationMs = (1 + next() * 4) * 60 * 1000;
    } else {
      label = 'Timing';
      color = SURFACE_GREY[500];
      durationMs = (0.5 + next() * 2) * 60 * 1000;
    }

    const descriptions: Record<string, string> = {
      'Signal Lost': 'Terminal lost contact with the satellite network.',
      'Reconnecting': 'Terminal is attempting to re-acquire network signal.',
      'Net Change': 'Network configuration or beam handoff detected.',
      'Timing': 'Timing synchronization event on the return link.'
    };

    if (label && color) {
      events.push({
        timestamp: cursor,
        endTimestamp: Math.min(cursor + durationMs, MOCK_END),
        label,
        color,
        description: descriptions[label]
      });
    }

    cursor = Math.min(cursor + durationMs, MOCK_END);
  }

  return events;
}
