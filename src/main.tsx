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
 * Description: Application entry point — sets Highcharts global defaults before React renders
 */
import Highcharts from 'highcharts/highstock';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Highcharts v12 removed `useUTC` from TimeOptions type definitions in favour
// of `timezone: 'UTC'`. Augment the type so we can set both for full runtime
// compatibility — `useUTC: true` is still honoured at runtime (D-04).
declare module 'highcharts' {
  interface TimeOptions {
    useUTC?: boolean;
  }
}

// MUST run before any React renders — cannot be moved into a component (D-04)
// Hex values are the ONLY permitted hardcoded hex outside colors.ts — Highcharts
// does not accept CSS custom properties
Highcharts.setOptions({
  time: {useUTC: true, timezone: 'UTC'},
  plotOptions: {
    series: {turboThreshold: 0}
  },
  chart: {
    style: {fontFamily: 'Source Sans Pro, sans-serif'},
    backgroundColor: 'transparent'
  },
  title: {style: {fontFamily: 'Uni Neue, sans-serif', fontWeight: '600'}},
  xAxis: {
    gridLineColor: '#DEE4E8', // SURFACE_GREY[200]
    lineColor: '#DEE4E8',
    tickColor: '#DEE4E8',
    labels: {style: {color: '#465967', fontSize: '12px'}} // SURFACE_GREY[600]
  },
  yAxis: {
    gridLineColor: '#DEE4E8',
    labels: {style: {color: '#465967', fontSize: '12px'}}
  }
});

const root = document.getElementById('root')!;
createRoot(root).render(<App />);
