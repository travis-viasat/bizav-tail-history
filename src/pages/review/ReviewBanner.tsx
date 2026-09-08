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
 * Description: Fixed-position banner for Add Chart drawer review pages.
 * Sits at z-index 1300 (above MUI Drawer's 1200) so it remains visible
 * even when the drawer is open. Shows state label, description, and
 * prev/next navigation between review states.
 */
import React from 'react';
import {Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import {Link} from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {Button, Chip} from '@viasat/beam-react';
import {WHITE, SURFACE_GREY} from '../../theme/colors';

export interface ReviewBannerState {
  id: number;
  label: string;
  description: string;
}

export interface ReviewBannerProps {
  stateId: number;
  states: ReviewBannerState[];
  basePath: string;
}

const BannerRoot = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 52,
  backgroundColor: SURFACE_GREY[900],
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 16px',
  zIndex: 1300
});

const IndexLink = styled(Link)({
  color: SURFACE_GREY[400],
  textDecoration: 'none',
  fontSize: 12,
  whiteSpace: 'nowrap',
  '&:hover': {color: WHITE}
});

const NavLink = styled(Link)({
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  color: SURFACE_GREY[400],
  fontSize: 12,
  '&:hover': {color: WHITE}
});

const LabelArea = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  overflow: 'hidden'
});

const StateLabel = styled('span')({
  color: WHITE,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: 14
});

const StateDescription = styled('span')({
  color: SURFACE_GREY[400],
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: 12
});

const StyledChip = styled(Chip)({
  backgroundColor: SURFACE_GREY[600],
  color: WHITE,
  fontSize: 11,
  height: 20
});

const ReviewBanner: React.FC<ReviewBannerProps> = ({stateId, states, basePath}) => {
  const state = states.find(s => s.id === stateId);
  const prev = states.find(s => s.id === stateId - 1);
  const next = states.find(s => s.id === stateId + 1);

  return (
    <BannerRoot>
      <IndexLink to="/review">All States</IndexLink>

      {prev ? (
        <NavLink to={`${basePath}/${prev.id}`}>
          <Button appearance="neutral" kind="bare" size="sm" iconBefore={<ArrowBackIcon fontSize="small" />}>
            Prev
          </Button>
        </NavLink>
      ) : (
        <Button appearance="neutral" kind="bare" size="sm" iconBefore={<ArrowBackIcon fontSize="small" />} disabled>
          Prev
        </Button>
      )}

      <LabelArea>
        <StyledChip size="sm">
          {`State ${stateId} of ${states.length}`}
        </StyledChip>
        <StateLabel>{state?.label}</StateLabel>
        <StateDescription>{state?.description}</StateDescription>
      </LabelArea>

      {next ? (
        <NavLink to={`${basePath}/${next.id}`}>
          <Button appearance="neutral" kind="bare" size="sm" iconAfter={<ArrowForwardIcon fontSize="small" />}>
            Next
          </Button>
        </NavLink>
      ) : (
        <Button appearance="neutral" kind="bare" size="sm" iconAfter={<ArrowForwardIcon fontSize="small" />} disabled>
          Next
        </Button>
      )}
    </BannerRoot>
  );
};

export default ReviewBanner;
