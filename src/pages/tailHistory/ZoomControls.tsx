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
 * Description: Zoom range slider indicator and Reset Zoom button
 */
import React from 'react';
import {Slider, Button, Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import useTailHistoryStore from './tailHistoryStore';

interface ZoomControlsProps {
  onResetZoom: () => void;
}

const ControlsRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '8px 32px'
});

const ZoomControls: React.FC<ZoomControlsProps> = ({onResetZoom}) => {
  const timeRange = useTailHistoryStore(state => state.timeRange);
  const zoomedRange = useTailHistoryStore(state => state.zoomedRange);

  const sliderMin = timeRange.start;
  const sliderMax = timeRange.end;
  const sliderValue: [number, number] = zoomedRange
    ? [zoomedRange.min, zoomedRange.max]
    : [timeRange.start, timeRange.end];

  return (
    <ControlsRow>
      <Slider
        min={sliderMin}
        max={sliderMax}
        value={sliderValue}
        step={60_000}
        disabled
        valueLabelDisplay="off"
        aria-label="Zoom range indicator"
        data-testid="zoom-slider"
        sx={{flex: 1}}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={onResetZoom}
        disabled={zoomedRange === null}
        data-testid="reset-zoom-button"
      >
        Reset Zoom
      </Button>
    </ControlsRow>
  );
};

export default ZoomControls;
