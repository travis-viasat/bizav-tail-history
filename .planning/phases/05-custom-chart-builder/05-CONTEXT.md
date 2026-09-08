# Phase 5: Custom Chart Builder - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning
**Source:** User's stated priorities throughout project initialization and Phase 3 discussion

<domain>
## Phase Boundary

This phase delivers the core differentiating feature of the Tail History view: the ability for aviation analysts to pick from 80+ metrics and build their own charts. All default charts (Phase 3) and zoom sync (Phase 2) are already in place. This phase adds the custom chart UI on top.

**What this phase delivers (CUSTOM-01 through CUSTOM-05):**
- "Add Chart" panel / drawer: searchable metric list (80+ metrics, categorized)
- Chart type picker per metric (line, area, bar, scatter — based on data shape compatibility)
- Add and render custom charts on the page (participate in zoom sync)
- Remove individual custom charts (clean up Highcharts instance)
- Drag-to-reorder custom charts (dnd-kit, session-persistent)

**What this phase does NOT do:**
- Real backend API calls — mock stubs continue (same pattern as Phase 3)
- Playback crosshair sync on custom charts (Phase 4)
- Shareable URL encoding of custom chart config (Phase v2)
- Persistent config after page refresh (Phase v2)

</domain>

<decisions>
## Locked Decisions (from initial project context and stated user priorities)

### D-01: This is the primary workflow
The user explicitly stated: "the focus is on allowing users to pick from metrics to build their custom charts." This is the #1 priority feature and the core value of the Tail History view. It must work well.

### D-02: Mock stubs, same as Phase 3
Custom charts use the same mock hook pattern as default charts. Real API integration is deferred until backend contracts exist. Each metric mock returns a typed time-series stub.

### D-03: Metric list — all 80+ metrics
The full metric list was provided during project initialization. The metric selector must show all of them, organized into categories, with real-time search filtering.

### D-04: Drag-to-reorder via dnd-kit
CUSTOM-05 uses dnd-kit (already referenced in research). Only custom charts are draggable — default charts stay fixed at top.

### D-05: Custom charts appear BELOW default charts
The 8 default chart strips (Phase 3) remain fixed at the top. Custom charts stack below them. The user adds/removes/reorders within the custom section only.

### D-06: Chart type compatibility rules
- Time-series numeric data → line, area, scatter
- Percentage/bounded data → line, area, bar  
- Status/state data → bar, area (no scatter)
- Boolean/event data → bar only
- The UI shows only compatible types for the selected metric

### D-07: "Add Chart" trigger
A prominent "Add Chart" button at the bottom of the chart stack opens the metric selector panel. The panel is a drawer or dialog — not inline.

### D-08: Session persistence only
Custom chart order and selection persist for the current browser session via Zustand store (customCharts slice, already defined in Phase 1). No localStorage, no server persistence.

### D-09: Zoom sync integration
Every custom chart must register with the chart registry (same pattern as default charts) so it participates in synchronized zoom. Use the same CHART_ID + makeSetExtremesHandler pattern.

### D-10: Deadline urgency
This phase is due the next day. Plans must be executable without unexpected blockers. Keep scope tight — CUSTOM-01 through CUSTOM-05 as written, nothing more.

</decisions>

<metrics_catalog>
## Available Metrics (80+ — to populate the metric selector)

From the project requirements, grouped by category:

**Connectivity & Availability**
- Connectivity Status, Service Availability, Network Status, iQe Score, Terminal Online Time, Terminal AVG Online Time, Time in network, BGP States

**CIR / MIR Throughput**
- Upstream CIR, Upstream Allocated CIR, Downstream CIR, Downstream Allocated CIR, MIR Upstream, MIR Downstream, CIR Fulfillment, CIR Satisfaction, Downstream Allocated MB, Upstream Allocated MB, Downstream Allocated Data Rate, Upstream Allocated Data Rate, Downstream QoS Demand to Allocation, Downstream Demand, Upstream Demand

**Bytes / Usage**
- Upstream bytes, Downstream bytes, Bytes Usage Downstream, Bytes Usage Upstream, Download Usage, Upload Usage, Cumulative Usage, Bandwidth Usage (CIR/MIR Allocated), SBB usage, Beam Download, Beam Upload

**Signal Quality**
- Terminal Upstream Average C/N0, Terminal Downstream Average C/N0, SNR (Signal to Noise Ratio), LQS Average Return CN0, LQS Average Forward CN0, LQS Average EMargin, Average and Minimum CN0, Average and Minimum SNR, SN0, CN0, Forward Link Quality, Return Link Quality, nomcarrierPwr, Nominal Tx Carrier Power

**Latency & Packet Loss**
- Latency, Latency (Max), Latency (Min), Packet loss, Jitter, AVG Downstream TCP Retransmit

**Errors & CRC**
- CRC Errors, CRC Downstream Errors, CRC Upstream Errors, Receiver CRC8, Max Acquisition Mismatch, Missing Acquisition Mismatch, Max frequency Offset, Max timing Offset

**Traffic & Application**
- Traffic Composition, Application Downstream Volume, Application Upstream Volume, Downstream UDP Bytes, Downstream TCP Bytes, Upstream UDP Bytes, Upstream TCP Bytes, SUM term us http bytes, SUM term us icmp bytes, SUM term us imp bytes, SUM term us other bytes, Downstream packets, Upstream packets, Downstream TCP Bytes

**Antenna & Beam**
- Altitude, Skew Angle, Azimuth, Elevation, Beam ID, Terminal Beam and Inet, AOR, Aircraft altitude and CN0, Terminal net, Max Terminal Bounce, Min Terminal Bounce

**Terminal Status**
- Terminal Uptime (Status), Modem Temperature (AVG temp celcius), Terminal MAX time tics, Last terminal status, Last term sas id, Last tail number, Last inet, Last cmid, Max idirect timestamp

**Events**
- Connectivity related events, iQe Score components (download performance, upload performance, network availability, transmission resilience)

</metrics_catalog>
