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
 * Description: Vitest test setup — extends expect with jest-dom matchers
 */
import '@testing-library/jest-dom';

// Highcharts v12 uses CSS.supports() internally — polyfill for jsdom environment
if (typeof window !== 'undefined' && !window.CSS) {
  Object.defineProperty(window, 'CSS', {
    value: {supports: () => false},
    writable: true
  });
} else if (typeof window !== 'undefined' && !window.CSS.supports) {
  window.CSS.supports = () => false;
}
