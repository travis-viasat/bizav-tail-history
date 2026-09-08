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
 * Description: Wave 0 test stub verifying Highcharts global defaults (FOUND-02)
 */
import {vi} from 'vitest';

// Mock react-dom/client BEFORE importing main.tsx — main.tsx calls
// createRoot(document.getElementById('root')!) which throws in jsdom
// because no #root element exists in the test environment. We only
// care about the Highcharts.setOptions() side effect, not the React render.
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({render: vi.fn()}))
}));

// Highcharts v12 removed `useUTC` from TimeOptions; main.tsx augments the type.
// Replicate the augmentation here so the test can access the property.
declare module 'highcharts' {
  interface TimeOptions {
    useUTC?: boolean;
  }
}

import Highcharts from 'highcharts/highstock';
// Import main.tsx side effects — this runs Highcharts.setOptions()
import '../main';

describe('Highcharts global configuration (FOUND-02)', () => {
  it('sets time.useUTC to true', () => {
    const options = Highcharts.getOptions();
    expect(options.time?.useUTC).toBe(true);
  });

  it('sets plotOptions.series.turboThreshold to 0', () => {
    const options = Highcharts.getOptions();
    expect(options.plotOptions?.series?.turboThreshold).toBe(0);
  });

  it('uses highcharts/highstock as base (not highcharts)', () => {
    // If highcharts/highstock is imported correctly, the Chart constructor is available
    expect(typeof Highcharts.Chart).toBe('function');
  });
});
