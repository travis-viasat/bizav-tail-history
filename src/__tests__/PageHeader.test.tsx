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
 * Description: Wave 0 tests for PageHeader (FOUND-04)
 */
import {vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {ThemeProvider} from '@mui/material/styles';
import theme from '../theme/Theme';

// vi.mock is hoisted to the top of the file by Vitest, so variables defined
// in module scope cannot be referenced inside the factory. Use vi.hoisted()
// to declare the mock function in the hoisted scope.
const {mockInvalidateQueries} = vi.hoisted(() => ({
  mockInvalidateQueries: vi.fn()
}));

// Mock the useFetch module to intercept queryClient.invalidateQueries calls.
// PageHeader imports queryClient directly from this module — NOT from the
// test's QueryClientProvider. We must mock at the module level.
vi.mock('../utils/useFetch', () => ({
  queryClient: {
    invalidateQueries: mockInvalidateQueries
  },
  useFetch: vi.fn()
}));

import PageHeader from '../pages/tailHistory/PageHeader';

const renderPageHeader = () => {
  const testQueryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}}
  });
  return {
    ...render(
      <QueryClientProvider client={testQueryClient}>
        <ThemeProvider theme={theme}>
          <PageHeader tailId="N12345" />
        </ThemeProvider>
      </QueryClientProvider>
    ),
    testQueryClient
  };
};

describe('PageHeader (FOUND-04)', () => {
  beforeEach(() => {
    mockInvalidateQueries.mockClear();
  });

  it('displays the tail ID', () => {
    renderPageHeader();
    expect(screen.getByTestId('tail-id-display')).toHaveTextContent('N12345');
  });

  it('renders the date range picker defaulting to last 14 days', () => {
    renderPageHeader();
    const today = new Date().toISOString().split('T')[0];
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400_000).toISOString().split('T')[0];

    // MUI TextField fallback — check the input values
    const startInput = screen.getByTestId('start-date-input').querySelector('input');
    const endInput = screen.getByTestId('end-date-input').querySelector('input');
    expect(startInput).toHaveValue(fourteenDaysAgo);
    expect(endInput).toHaveValue(today);
  });

  it('calls queryClient.invalidateQueries when date range changes (FOUND-04)', () => {
    renderPageHeader();
    // Click the Apply button to trigger setTimeRange + invalidateQueries
    fireEvent.click(screen.getByTestId('apply-date-range'));
    // Verify the singleton queryClient from useFetch.ts had invalidateQueries called
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
  });
});
