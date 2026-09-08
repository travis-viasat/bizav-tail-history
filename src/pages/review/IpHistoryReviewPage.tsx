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
 * Description: Review gallery for the IP History chart — route: /review/ip-history/:stateId.
 * Renders the full TailHistoryPage as backdrop with the IP History chart
 * pre-configured in the requested state via _reviewIpHistoryState.
 */
import React from 'react';
import {useParams, Navigate} from 'react-router-dom';
import {Box} from '@mui/material';
import TailHistoryPage from '../tailHistory/TailHistoryPage';
import ReviewBanner from './ReviewBanner';
import {IP_HISTORY_REVIEW_STATES} from './ipHistoryReviewStates';

const BANNER_HEIGHT = 52;

const IpHistoryReviewPage: React.FC = () => {
  const {stateId} = useParams<{stateId: string}>();
  const id = Number(stateId);
  const state = IP_HISTORY_REVIEW_STATES.find(s => s.id === id);

  if (!state) {
    return <Navigate replace to="/review/ip-history" />;
  }

  return (
    <>
      <ReviewBanner
        stateId={state.id}
        states={IP_HISTORY_REVIEW_STATES}
        basePath="/review/ip-history"
      />
      <Box sx={{paddingTop: `${BANNER_HEIGHT}px`}}>
        <TailHistoryPage
          _reviewTailId="demo"
          _reviewIpHistoryState={state.chartState}
        />
      </Box>
    </>
  );
};

export default IpHistoryReviewPage;
