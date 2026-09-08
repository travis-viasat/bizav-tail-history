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
 * Description: Page header with tail ID display and date range picker (MUI TextField fallback — @viasat/insights-components unavailable)
 */
import React, {useState, useCallback} from 'react';
import {styled} from '@mui/material/styles';
import {Box, Typography, TextField, Button} from '@mui/material';
import useTailHistoryStore from './tailHistoryStore';
import {queryClient} from '../../utils/useFetch';
import {WHITE} from '../../theme/colors';

interface PageHeaderProps {
  tailId: string;
}

const HeaderContainer = styled(Box)(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px 32px',
  backgroundColor: WHITE,
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: '64px'
}));

const DatePickerRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
});

// Default to last 14 days
const getDefaultStart = () => new Date(Date.now() - 14 * 86400_000).toISOString().split('T')[0];
const getDefaultEnd = () => new Date().toISOString().split('T')[0];

const PageHeader: React.FC<PageHeaderProps> = ({tailId}) => {
  const setTimeRange = useTailHistoryStore(state => state.setTimeRange);
  const [startDate, setStartDate] = useState<string>(getDefaultStart);
  const [endDate, setEndDate] = useState<string>(getDefaultEnd);

  const handleApply = useCallback(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    setTimeRange({start, end});
    queryClient.invalidateQueries();
  }, [startDate, endDate, setTimeRange]);

  return (
    <HeaderContainer>
      <Typography variant="h6" data-testid="tail-id-display">
        {tailId}
      </Typography>
      <DatePickerRow>
        <TextField
          label="Start date"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          slotProps={{inputLabel: {shrink: true}}}
          size="small"
          data-testid="start-date-input"
        />
        <TextField
          label="End date"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          slotProps={{inputLabel: {shrink: true}}}
          size="small"
          data-testid="end-date-input"
        />
        <Button variant="contained" onClick={handleApply} data-testid="apply-date-range" size="small">
          Apply
        </Button>
      </DatePickerRow>
    </HeaderContainer>
  );
};

export default PageHeader;
