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
 * Description: State definitions for the Add Chart drawer stakeholder review pages.
 * Each entry maps to a /review/:stateId route and pre-seeds the AddChartDrawer
 * with a specific set of metrics to demonstrate a meaningful UI state.
 */

export interface ReviewState {
  id: number;
  label: string;
  /** One-line context shown in the review banner */
  description: string;
  /** Metric keys from metricCatalog — resolved by AddChartDrawer on mount */
  metrics: string[];
}

/**
 * The four meaningful states of the Add Chart drawer flow.
 *
 * State 1 — Empty
 *   Drawer open, no metrics selected. Baseline / initial view.
 *
 * State 2 — Single metric (all chart types)
 *   One NUMERIC metric selected → all 4 chart types available (Line / Area / Bar / Scatter).
 *
 * State 3 — Constrained chart types
 *   Mix of STATUS_STATE (bar, area) + NUMERIC (line, area, bar, scatter) metrics.
 *   Intersection removes Line and Scatter → only Bar and Area offered.
 *
 * State 4 — Max metrics reached (7 of 7)
 *   Seven metrics selected (NUMERIC + PERCENTAGE mix) → remaining metrics greyed out.
 *   Chart types constrained to Line / Area / Bar (Scatter removed by PERCENTAGE metrics).
 */
export const REVIEW_STATES: ReviewState[] = [
  {
    id: 1,
    label: 'Empty',
    description: 'Drawer just opened — no metrics selected yet.',
    metrics: []
  },
  {
    id: 2,
    label: 'Single Metric — All Chart Types',
    description: '1 metric selected (NUMERIC) — all 4 chart types available: Line, Area, Bar, Scatter.',
    metrics: ['iqe_score']
  },
  {
    id: 3,
    label: 'Constrained Chart Types',
    description: 'Mixed metric types (Status + Numeric) — chart options reduced to Bar and Area only.',
    metrics: ['connectivity_status', 'iqe_score', 'upstream_cir']
  },
  {
    id: 4,
    label: 'Max Metrics (7 of 7)',
    description: '7 metrics selected — all remaining metrics are disabled. Chart types: Line, Area, Bar.',
    metrics: [
      'iqe_score',
      'latency',
      'packet_loss',
      'upstream_cir',
      'downstream_cir',
      'snr',
      'service_availability'
    ]
  }
];
