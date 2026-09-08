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
 * Description: Review frame for a single Add Chart drawer state.
 * Resolves the stateId URL param to a ReviewState config, renders the
 * ReviewBanner (fixed, 52px), and mounts the full TailHistoryPage beneath it
 * with the AddChartDrawer pinned open in the pre-configured state.
 *
 * Routes: /review/1  /review/2  /review/3  /review/4
 */
import React from 'react';
import {useParams, Navigate} from 'react-router-dom';
import {Box} from '@mui/material';
import TailHistoryPage from '../tailHistory/TailHistoryPage';
import ReviewBanner from './ReviewBanner';
import {REVIEW_STATES} from './reviewStates';

/** Height of the ReviewBanner — keeps content from hiding under it */
const BANNER_HEIGHT = 52;

const ReviewStatePage: React.FC = () => {
  const {stateId} = useParams<{stateId: string}>();
  const id = Number(stateId);
  const state = REVIEW_STATES.find(s => s.id === id);

  if (!state) {
    return <Navigate replace to="/review" />;
  }

  return (
    <>
      <ReviewBanner stateId={state.id} states={REVIEW_STATES} basePath="/review" />
      <Box sx={{paddingTop: `${BANNER_HEIGHT}px`}}>
        <TailHistoryPage
          _reviewTailId="demo"
          _reviewDrawerOpen={true}
          _reviewInitialMetrics={state.metrics}
        />
      </Box>
    </>
  );
};

export default ReviewStatePage;
