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
 * Description: Metric catalog for the custom chart builder — 80+ MetricDefinition entries
 * covering all 10 metric categories. Compatibility rules (D-06) determine chart type options.
 */

/** Supported chart types for custom charts */
export type ChartType = 'line' | 'area' | 'bar' | 'scatter';

/** All 10 metric categories available in the custom chart builder */
export type MetricCategory =
  | 'Connectivity & Availability'
  | 'CIR / MIR Throughput'
  | 'Bytes / Usage'
  | 'Signal Quality'
  | 'Latency & Packet Loss'
  | 'Errors & CRC'
  | 'Traffic & Application'
  | 'Antenna & Beam'
  | 'Terminal Status'
  | 'Events';

/** A single metric entry in the catalog */
export interface MetricDefinition {
  /** Snake_case unique identifier — matches metricId in ChartDefinition */
  key: string;
  /** Human-readable label for display in the metric picker */
  label: string;
  /** Grouping category for the metric picker drawer */
  category: MetricCategory;
  /**
   * Chart types compatible with this metric per D-06 rules:
   * - status/state metrics → ['bar', 'area']
   * - boolean/event metrics → ['bar']
   * - percentage/bounded metrics → ['line', 'area', 'bar']
   * - all other numeric/throughput/signal metrics → ['line', 'area', 'scatter']
   */
  compatibleChartTypes: ChartType[];
  /** Optional unit label (e.g. 'Mbps', 'ms', '%', '°C') */
  units?: string;
}

// ─── Compatibility rule sets ───────────────────────────────────────────────────
const STATUS_STATE: ChartType[] = ['bar', 'area'];
const BOOLEAN_EVENT: ChartType[] = ['bar'];
const PERCENTAGE: ChartType[] = ['line', 'area', 'bar'];
const NUMERIC: ChartType[] = ['line', 'area', 'bar', 'scatter'];

// ─── Metric Catalog ────────────────────────────────────────────────────────────

export const METRIC_CATALOG: MetricDefinition[] = [
  // ── Connectivity & Availability (8) ──────────────────────────────────────────
  {
    key: 'connectivity_status',
    label: 'Connectivity Status',
    category: 'Connectivity & Availability',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'service_availability',
    label: 'Service Availability',
    category: 'Connectivity & Availability',
    compatibleChartTypes: PERCENTAGE,
    units: '%'
  },
  {
    key: 'network_status',
    label: 'Network Status',
    category: 'Connectivity & Availability',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'iqe_score',
    label: 'iQe Score',
    category: 'Connectivity & Availability',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'terminal_online_time',
    label: 'Terminal Online Time',
    category: 'Connectivity & Availability',
    compatibleChartTypes: NUMERIC,
    units: 'min'
  },
  {
    key: 'terminal_avg_online_time',
    label: 'Terminal Avg Online Time',
    category: 'Connectivity & Availability',
    compatibleChartTypes: NUMERIC,
    units: 'min'
  },
  {
    key: 'time_in_network',
    label: 'Time in Network',
    category: 'Connectivity & Availability',
    compatibleChartTypes: NUMERIC,
    units: 'min'
  },
  {
    key: 'bgp_states',
    label: 'BGP States',
    category: 'Connectivity & Availability',
    compatibleChartTypes: STATUS_STATE
  },

  // ── CIR / MIR Throughput (15) ─────────────────────────────────────────────────
  {
    key: 'upstream_cir',
    label: 'Upstream CIR',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'upstream_allocated_cir',
    label: 'Upstream Allocated CIR',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'downstream_cir',
    label: 'Downstream CIR',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'downstream_allocated_cir',
    label: 'Downstream Allocated CIR',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'mir_upstream',
    label: 'MIR Upstream',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'mir_downstream',
    label: 'MIR Downstream',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'cir_fulfillment',
    label: 'CIR Fulfillment',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: PERCENTAGE,
    units: '%'
  },
  {
    key: 'cir_satisfaction',
    label: 'CIR Satisfaction',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: PERCENTAGE,
    units: '%'
  },
  {
    key: 'downstream_allocated_mb',
    label: 'Downstream Allocated MB',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'upstream_allocated_mb',
    label: 'Upstream Allocated MB',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'downstream_allocated_data_rate',
    label: 'Downstream Allocated Data Rate',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'upstream_allocated_data_rate',
    label: 'Upstream Allocated Data Rate',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'downstream_qos_demand_to_allocation',
    label: 'Downstream QoS Demand to Allocation',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'downstream_demand',
    label: 'Downstream Demand',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'upstream_demand',
    label: 'Upstream Demand',
    category: 'CIR / MIR Throughput',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },

  // ── Bytes / Usage (11) ────────────────────────────────────────────────────────
  {
    key: 'upstream_bytes',
    label: 'Upstream Bytes',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'downstream_bytes',
    label: 'Downstream Bytes',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'bytes_usage_downstream',
    label: 'Bytes Usage Downstream',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'bytes_usage_upstream',
    label: 'Bytes Usage Upstream',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'download_usage',
    label: 'Download Usage',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'upload_usage',
    label: 'Upload Usage',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'cumulative_usage',
    label: 'Cumulative Usage',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'bandwidth_usage_cir_mir',
    label: 'Bandwidth Usage CIR/MIR',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'Mbps'
  },
  {
    key: 'sbb_usage',
    label: 'SBB Usage',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'beam_download',
    label: 'Beam Download',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'beam_upload',
    label: 'Beam Upload',
    category: 'Bytes / Usage',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },

  // ── Signal Quality (14) ───────────────────────────────────────────────────────
  {
    key: 'terminal_upstream_cn0',
    label: 'Terminal Upstream CN0',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'terminal_downstream_cn0',
    label: 'Terminal Downstream CN0',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'snr',
    label: 'SNR',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'lqs_avg_return_cn0',
    label: 'LQS Avg Return CN0',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'lqs_avg_forward_cn0',
    label: 'LQS Avg Forward CN0',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'lqs_avg_emargin',
    label: 'LQS Avg Emargin',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'avg_min_cn0',
    label: 'Avg Min CN0',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'avg_min_snr',
    label: 'Avg Min SNR',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'sn0',
    label: 'SN0',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'cn0',
    label: 'CN0',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dB'
  },
  {
    key: 'forward_link_quality',
    label: 'Forward Link Quality',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'return_link_quality',
    label: 'Return Link Quality',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'nomcarrier_pwr',
    label: 'Nominal Carrier Power',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dBm'
  },
  {
    key: 'nominal_tx_carrier_power',
    label: 'Nominal TX Carrier Power',
    category: 'Signal Quality',
    compatibleChartTypes: NUMERIC,
    units: 'dBm'
  },

  // ── Latency & Packet Loss (6) ─────────────────────────────────────────────────
  {
    key: 'latency',
    label: 'Latency',
    category: 'Latency & Packet Loss',
    compatibleChartTypes: NUMERIC,
    units: 'ms'
  },
  {
    key: 'latency_max',
    label: 'Latency Max',
    category: 'Latency & Packet Loss',
    compatibleChartTypes: NUMERIC,
    units: 'ms'
  },
  {
    key: 'latency_min',
    label: 'Latency Min',
    category: 'Latency & Packet Loss',
    compatibleChartTypes: NUMERIC,
    units: 'ms'
  },
  {
    key: 'packet_loss',
    label: 'Packet Loss',
    category: 'Latency & Packet Loss',
    compatibleChartTypes: PERCENTAGE,
    units: '%'
  },
  {
    key: 'jitter',
    label: 'Jitter',
    category: 'Latency & Packet Loss',
    compatibleChartTypes: NUMERIC,
    units: 'ms'
  },
  {
    key: 'avg_downstream_tcp_retransmit',
    label: 'Avg Downstream TCP Retransmit',
    category: 'Latency & Packet Loss',
    compatibleChartTypes: NUMERIC
  },

  // ── Errors & CRC (8) ─────────────────────────────────────────────────────────
  {
    key: 'crc_errors',
    label: 'CRC Errors',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'crc_downstream_errors',
    label: 'CRC Downstream Errors',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'crc_upstream_errors',
    label: 'CRC Upstream Errors',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'receiver_crc8',
    label: 'Receiver CRC8',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'max_acquisition_mismatch',
    label: 'Max Acquisition Mismatch',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'missing_acquisition_mismatch',
    label: 'Missing Acquisition Mismatch',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'max_frequency_offset',
    label: 'Max Frequency Offset',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC,
    units: 'Hz'
  },
  {
    key: 'max_timing_offset',
    label: 'Max Timing Offset',
    category: 'Errors & CRC',
    compatibleChartTypes: NUMERIC,
    units: 'ns'
  },

  // ── Traffic & Application (13) ────────────────────────────────────────────────
  {
    key: 'traffic_composition',
    label: 'Traffic Composition',
    category: 'Traffic & Application',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'app_downstream_volume',
    label: 'App Downstream Volume',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'app_upstream_volume',
    label: 'App Upstream Volume',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'MB'
  },
  {
    key: 'downstream_udp_bytes',
    label: 'Downstream UDP Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'downstream_tcp_bytes',
    label: 'Downstream TCP Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'upstream_udp_bytes',
    label: 'Upstream UDP Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'upstream_tcp_bytes',
    label: 'Upstream TCP Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'sum_term_us_http_bytes',
    label: 'Sum Term US HTTP Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'sum_term_us_icmp_bytes',
    label: 'Sum Term US ICMP Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'sum_term_us_imp_bytes',
    label: 'Sum Term US IMP Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'sum_term_us_other_bytes',
    label: 'Sum Term US Other Bytes',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC,
    units: 'bytes'
  },
  {
    key: 'downstream_packets',
    label: 'Downstream Packets',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'upstream_packets',
    label: 'Upstream Packets',
    category: 'Traffic & Application',
    compatibleChartTypes: NUMERIC
  },

  // ── Antenna & Beam (11) ───────────────────────────────────────────────────────
  {
    key: 'altitude',
    label: 'Altitude',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC,
    units: 'ft'
  },
  {
    key: 'skew_angle',
    label: 'Skew Angle',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC,
    units: '°'
  },
  {
    key: 'azimuth',
    label: 'Azimuth',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC,
    units: '°'
  },
  {
    key: 'elevation',
    label: 'Elevation',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC,
    units: '°'
  },
  {
    key: 'beam_id',
    label: 'Beam ID',
    category: 'Antenna & Beam',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'terminal_beam_and_inet',
    label: 'Terminal Beam and iNet',
    category: 'Antenna & Beam',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'aor',
    label: 'AOR',
    category: 'Antenna & Beam',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'aircraft_altitude_and_cn0',
    label: 'Aircraft Altitude and CN0',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'terminal_net',
    label: 'Terminal Net',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'max_terminal_bounce',
    label: 'Max Terminal Bounce',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'min_terminal_bounce',
    label: 'Min Terminal Bounce',
    category: 'Antenna & Beam',
    compatibleChartTypes: NUMERIC
  },

  // ── Terminal Status (9) ───────────────────────────────────────────────────────
  {
    key: 'terminal_uptime',
    label: 'Terminal Uptime',
    category: 'Terminal Status',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'modem_temperature',
    label: 'Modem Temperature',
    category: 'Terminal Status',
    compatibleChartTypes: NUMERIC,
    units: '°C'
  },
  {
    key: 'terminal_max_time_tics',
    label: 'Terminal Max Time Tics',
    category: 'Terminal Status',
    compatibleChartTypes: NUMERIC
  },
  {
    key: 'last_terminal_status',
    label: 'Last Terminal Status',
    category: 'Terminal Status',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'last_term_sas_id',
    label: 'Last Term SAS ID',
    category: 'Terminal Status',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'last_tail_number',
    label: 'Last Tail Number',
    category: 'Terminal Status',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'last_inet',
    label: 'Last iNet',
    category: 'Terminal Status',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'last_cmid',
    label: 'Last CMID',
    category: 'Terminal Status',
    compatibleChartTypes: STATUS_STATE
  },
  {
    key: 'max_idirect_timestamp',
    label: 'Max iDirect Timestamp',
    category: 'Terminal Status',
    compatibleChartTypes: STATUS_STATE
  },

  // ── Events (2) ────────────────────────────────────────────────────────────────
  {
    key: 'connectivity_events',
    label: 'Connectivity Events',
    category: 'Events',
    compatibleChartTypes: BOOLEAN_EVENT
  },
  {
    key: 'iqe_score_components',
    label: 'iQe Score Components',
    category: 'Events',
    compatibleChartTypes: BOOLEAN_EVENT
  }
];

/**
 * Convenience lookup: metrics grouped by category.
 * Useful for rendering the drawer's grouped metric list.
 */
export const METRIC_CATALOG_BY_CATEGORY: Record<MetricCategory, MetricDefinition[]> =
  METRIC_CATALOG.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {} as Record<MetricCategory, MetricDefinition[]>
  );
