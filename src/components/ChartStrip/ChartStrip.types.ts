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
 * Description: TypeScript interface for ChartStrip component props
 */
import type Highcharts from 'highcharts/highstock';

export interface ChartStripProps {
  /** Stable UUID — React key AND chart registry key */
  chartId: string;
  /** Chart title displayed above the chart */
  title: string;
  /** Series data — array of Highcharts SeriesOptionsType */
  series: Highcharts.SeriesOptionsType[];
  /** Register this chart instance in the parent registry */
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  /** Deregister this chart instance from the parent registry */
  unregisterChart: (id: string) => void;
  /** Sync handler — fires when this chart's xAxis extremes change */
  onSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => void;
  /** Container height in pixels (default 200) */
  height?: number;
}
