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
 * Description: Index page for the IP History chart review gallery.
 * Lists all 4 review states as clickable cards so reviewers can jump
 * directly to any state without navigating the application.
 *
 * Route: /review/ip-history
 */
import React from 'react';
import {Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import {Link} from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {Text, Chip, Card} from '@viasat/beam-react';
import {SURFACE_GREY, WHITE} from '../../theme/colors';
import {IP_HISTORY_REVIEW_STATES} from './ipHistoryReviewStates';

const PageRoot = styled(Box)({
  minHeight: '100vh',
  backgroundColor: SURFACE_GREY[100],
  padding: '48px 32px'
});

const Grid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 16,
  marginTop: 32
});

const StyledCard = styled(Card)({
  border: `1px solid ${SURFACE_GREY[200]}`,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
  }
});

const CardLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block'
});

const StateChip = styled(Chip)({
  backgroundColor: SURFACE_GREY[900],
  color: WHITE,
  fontSize: 11
});

const IpHistoryReviewIndexPage: React.FC = () => (
  <PageRoot>
    <Text kind="heading-lg" bold style={{color: SURFACE_GREY[900]}}>
      IP History Chart — Review
    </Text>
    <Text kind="body-md" color="secondary" style={{marginTop: 8}}>
      Each state shows the full Tail History view with the IP History chart pre-configured. Click a card to open that state.
    </Text>

    <Grid>
      {IP_HISTORY_REVIEW_STATES.map(state => (
        <CardLink key={state.id} to={`/review/ip-history/${state.id}`}>
          <StyledCard>
            <Card.Body>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                <StateChip size="sm">State {state.id}</StateChip>
                <Text kind="label-md" bold>{state.label}</Text>
              </Box>
              <Text kind="body-md" color="secondary">
                {state.description}
              </Text>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: 16, color: SURFACE_GREY[600]}}>
                <Text kind="detail-md" style={{color: SURFACE_GREY[600]}}>Open state</Text>
                <ArrowForwardIcon style={{fontSize: 14}} />
              </Box>
            </Card.Body>
          </StyledCard>
        </CardLink>
      ))}
    </Grid>
  </PageRoot>
);

export default IpHistoryReviewIndexPage;
