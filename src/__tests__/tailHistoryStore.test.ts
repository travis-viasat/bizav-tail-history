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
 * Description: Wave 0 tests for tailHistoryStore (FOUND-03)
 */
import useTailHistoryStore from '../pages/tailHistory/tailHistoryStore';

describe('tailHistoryStore (FOUND-03)', () => {
  beforeEach(() => {
    // Reset store before each test
    useTailHistoryStore.getState().reset();
  });

  it('initializes with timeRange covering the last 14 days', () => {
    const {timeRange} = useTailHistoryStore.getState();
    const fourteenDaysMs = 14 * 86400_000;
    const now = Date.now();
    // end should be near now (within 5 seconds tolerance)
    expect(timeRange.end).toBeGreaterThan(now - 5000);
    // start should be approximately 14 days before end
    expect(timeRange.end - timeRange.start).toBeCloseTo(fourteenDaysMs, -3);
  });

  it('initializes zoomedRange as null', () => {
    expect(useTailHistoryStore.getState().zoomedRange).toBeNull();
  });

  it('initializes playhead as null', () => {
    expect(useTailHistoryStore.getState().playhead).toBeNull();
  });

  it('initializes playback as {isPlaying: false, speed: 1}', () => {
    const {playback} = useTailHistoryStore.getState();
    expect(playback.isPlaying).toBe(false);
    expect(playback.speed).toBe(1);
  });

  it('initializes customCharts as empty array', () => {
    expect(useTailHistoryStore.getState().customCharts).toEqual([]);
  });

  it('setTimeRange updates only timeRange without affecting other slices', () => {
    const newRange = {start: 1000, end: 2000};
    useTailHistoryStore.getState().setTimeRange(newRange);
    const state = useTailHistoryStore.getState();
    expect(state.timeRange).toEqual(newRange);
    expect(state.zoomedRange).toBeNull();
    expect(state.playhead).toBeNull();
    expect(state.customCharts).toEqual([]);
  });

  it('setZoomedRange updates zoomedRange', () => {
    useTailHistoryStore.getState().setZoomedRange({min: 500, max: 1500});
    expect(useTailHistoryStore.getState().zoomedRange).toEqual({min: 500, max: 1500});
  });

  it('reset restores initial state', () => {
    useTailHistoryStore.getState().setTimeRange({start: 0, end: 100});
    useTailHistoryStore.getState().setZoomedRange({min: 10, max: 90});
    useTailHistoryStore.getState().reset();
    expect(useTailHistoryStore.getState().zoomedRange).toBeNull();
    expect(useTailHistoryStore.getState().playhead).toBeNull();
  });
});
