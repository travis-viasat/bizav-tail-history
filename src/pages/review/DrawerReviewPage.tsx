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
 * Description: Design-review page for the AddChartDrawer.
 *
 * Route: /review/drawer
 *
 * Opens TailHistoryPage with the AddChartDrawer pre-opened (no-op onClose) and
 * a representative cross-category metric pre-selection so designers can review
 * the drawer layout, chip row, ChartTypePicker, and Add Chart button without
 * having to manually interact with the page first.
 *
 * This page is intentionally NOT wired into the production navigation — it is
 * accessible only via the /review/drawer route which is registered in App.tsx
 * for local-dev / design-review purposes.
 */
import React from 'react';
import TailHistoryPage from '../tailHistory/TailHistoryPage';

/**
 * Representative cross-category pre-selection for the drawer review.
 *
 * Chosen to demonstrate:
 * - Multiple selected metrics (chip row visible)
 * - Mixed compatible chart types (line/area/bar/scatter intersection is non-empty
 *   but narrowed — ChartTypePicker shows the constrained set)
 * - Metrics from different categories so the grouped list is scrolled
 *
 * All keys are verified against metricCatalog.ts; unknown keys are silently
 * dropped by AddChartDrawer._reviewInitialMetrics handling.
 */
const REVIEW_METRICS: string[] = [
  'iqe_score',          // Connectivity & Availability — NUMERIC
  'latency',            // Latency & Packet Loss — NUMERIC
  'packet_loss',        // Latency & Packet Loss — PERCENTAGE (line/area/bar)
  'upstream_cir',       // CIR / MIR Throughput — NUMERIC
  'snr'                 // Signal Quality — NUMERIC
];

/**
 * DrawerReviewPage — renders TailHistoryPage with the AddChartDrawer pinned open
 * and REVIEW_METRICS pre-selected.  The tail ID is fixed to "demo" so the page
 * loads without requiring a real URL param.
 */
const DrawerReviewPage: React.FC = () => (
  <TailHistoryPage
    _reviewTailId="demo"
    _reviewDrawerOpen={true}
    _reviewInitialMetrics={REVIEW_METRICS}
  />
);

export default DrawerReviewPage;
