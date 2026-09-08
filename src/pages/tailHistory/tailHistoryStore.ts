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
 * Description: Tail History view store — all 5 slices: timeRange, zoomedRange, playhead, playback, customCharts
 */
import createViewStore from '../../utils/createViewStore';

export interface TimeRange {
  start: number; // epoch ms
  end: number; // epoch ms
}

export interface ZoomedRange {
  min: number; // epoch ms
  max: number; // epoch ms
}

export interface PlaybackState {
  isPlaying: boolean;
  speed: 0.5 | 1 | 2 | 4;
}

export interface ChartDefinition {
  id: string; // stable UUID — React key, registry key
  metricId: string;
  chartType: 'line' | 'bar' | 'area' | 'scatter';
}

interface TailHistoryState {
  timeRange: TimeRange;
  zoomedRange: ZoomedRange | null;
  playhead: number | null;
  playback: PlaybackState;
  customCharts: ChartDefinition[];
}

const DEFAULT_RANGE_DAYS = 14;
const now = Date.now();
const initialState: TailHistoryState = {
  timeRange: {start: now - DEFAULT_RANGE_DAYS * 86400_000, end: now},
  zoomedRange: null,
  playhead: null,
  playback: {isPlaying: false, speed: 1},
  customCharts: []
};

const DONT_PERSIST = ['playhead', 'playback'];

const useTailHistoryStore = createViewStore(
  'tail-history-view',
  initialState,
  set => ({
    setTimeRange: (timeRange: TimeRange) => set({timeRange}),
    setZoomedRange: (zoomedRange: ZoomedRange | null) => set({zoomedRange}),
    setPlayhead: (playhead: number | null) => set({playhead}),
    setPlayback: (playback: Partial<PlaybackState>) =>
      set(state => ({playback: {...state.playback, ...playback}})),
    addCustomChart: (chart: ChartDefinition) =>
      set(state => ({customCharts: [...state.customCharts, chart]})),
    removeCustomChart: (id: string) =>
      set(state => ({customCharts: state.customCharts.filter((c: ChartDefinition) => c.id !== id)})),
    reorderCustomCharts: (charts: ChartDefinition[]) => set({customCharts: charts}),
    reset: () => set(initialState)
  }),
  DONT_PERSIST
);

export default useTailHistoryStore;
