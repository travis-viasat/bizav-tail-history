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
 * Description: Tests for ZoomControls — slider range update (ZOOM-03) and reset (ZOOM-04)
 */
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';

// vi.hoisted ensures the mock factory can reference variables in module scope
const {mockStoreImpl} = vi.hoisted(() => ({
  mockStoreImpl: vi.fn()
}));

// Mock the Zustand store so we can control timeRange and zoomedRange
vi.mock('../pages/tailHistory/tailHistoryStore', () => ({
  default: mockStoreImpl
}));

import ZoomControls from '../pages/tailHistory/ZoomControls';

const TIME_RANGE = {start: 1000, end: 5000};

/** Configure what the mocked store returns for a given selector */
function setupStoreMock(zoomedRange: {min: number; max: number} | null) {
  mockStoreImpl.mockImplementation(
    (selector: (state: {timeRange: typeof TIME_RANGE; zoomedRange: typeof zoomedRange}) => unknown) =>
      selector({timeRange: TIME_RANGE, zoomedRange})
  );
}

describe('ZoomControls (ZOOM-03, ZOOM-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStoreMock(null);
  });

  it('renders slider with full range when zoomedRange is null', () => {
    setupStoreMock(null);
    render(<ZoomControls onResetZoom={vi.fn()} />);
    // MUI Slider renders hidden inputs for each thumb
    const sliderContainer = screen.getByTestId('zoom-slider');
    // The first hidden input carries the value for thumb 0
    const inputs = sliderContainer.querySelectorAll('input');
    expect(inputs[0]).toHaveValue('1000');
    expect(inputs[1]).toHaveValue('5000');
  });

  it('renders slider with zoomed range when zoomedRange is non-null', () => {
    setupStoreMock({min: 2000, max: 3000});
    render(<ZoomControls onResetZoom={vi.fn()} />);
    const sliderContainer = screen.getByTestId('zoom-slider');
    const inputs = sliderContainer.querySelectorAll('input');
    expect(inputs[0]).toHaveValue('2000');
    expect(inputs[1]).toHaveValue('3000');
  });

  it('Reset Zoom button is disabled when zoomedRange is null', () => {
    setupStoreMock(null);
    render(<ZoomControls onResetZoom={vi.fn()} />);
    expect(screen.getByTestId('reset-zoom-button')).toBeDisabled();
  });

  it('Reset Zoom button is enabled when zoomedRange is non-null', () => {
    setupStoreMock({min: 2000, max: 3000});
    render(<ZoomControls onResetZoom={vi.fn()} />);
    expect(screen.getByTestId('reset-zoom-button')).not.toBeDisabled();
  });

  it('calls onResetZoom when Reset Zoom button is clicked', () => {
    setupStoreMock({min: 2000, max: 3000});
    const onResetZoom = vi.fn();
    render(<ZoomControls onResetZoom={onResetZoom} />);
    fireEvent.click(screen.getByTestId('reset-zoom-button'));
    expect(onResetZoom).toHaveBeenCalledTimes(1);
  });

  it('slider has data-testid zoom-slider', () => {
    render(<ZoomControls onResetZoom={vi.fn()} />);
    expect(screen.getByTestId('zoom-slider')).toBeInTheDocument();
  });

  it('slider is disabled (read-only indicator)', () => {
    render(<ZoomControls onResetZoom={vi.fn()} />);
    const sliderContainer = screen.getByTestId('zoom-slider');
    const inputs = sliderContainer.querySelectorAll('input');
    // All thumb inputs should be disabled on a disabled MUI Slider
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });
});
