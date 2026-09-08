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
 * Description: Landing page for Add Chart drawer stakeholder review.
 * Lists all 4 review states as clickable cards so reviewers can jump
 * directly to any state without navigating the application.
 *
 * Route: /review
 */
import React from 'react';
import {Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import {Link} from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {Text, Chip, Card} from '@viasat/beam-react';
import {SURFACE_GREY, WHITE} from '../../theme/colors';
import {REVIEW_STATES} from './reviewStates';
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

const ReviewIndexPage: React.FC = () => (
  <PageRoot>
    <Text kind="heading-xl" bold style={{color: SURFACE_GREY[900]}}>
      Design Review
    </Text>
    <Text kind="body-md" color="secondary" style={{marginTop: 8, marginBottom: 32}}>
      Stakeholder review galleries — each state links to the full app pre-configured for that scenario.
    </Text>

    <Text kind="heading-md" bold style={{color: SURFACE_GREY[900]}}>
      Add Chart Drawer
    </Text>
    <Text kind="body-md" color="secondary" style={{marginTop: 4}}>
      The drawer pre-opened with a specific metric selection.
    </Text>

    <Grid>
      {REVIEW_STATES.map(state => (
        <CardLink key={state.id} to={`/review/${state.id}`}>
          <StyledCard>
            <Card.Body>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                <StateChip size="sm">State {state.id}</StateChip>
                <Text kind="label-md" bold>{state.label}</Text>
              </Box>
              <Text kind="body-md" color="secondary">
                {state.description}
              </Text>
              {state.metrics.length > 0 && (
                <Box sx={{mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                  {state.metrics.map(key => (
                    <Chip key={key} size="sm" style={{fontSize: 10, height: 20}}>
                      {key.replace(/_/g, ' ')}
                    </Chip>
                  ))}
                </Box>
              )}
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: 16, color: SURFACE_GREY[600]}}>
                <Text kind="detail-md" style={{color: SURFACE_GREY[600]}}>Open state</Text>
                <ArrowForwardIcon style={{fontSize: 14}} />
              </Box>
            </Card.Body>
          </StyledCard>
        </CardLink>
      ))}
    </Grid>

    <Text kind="heading-md" bold style={{color: SURFACE_GREY[900], marginTop: 48}}>
      IP History Chart
    </Text>
    <Text kind="body-md" color="secondary" style={{marginTop: 4}}>
      The IP History chart pre-configured in each of its four render states.
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

export default ReviewIndexPage;
