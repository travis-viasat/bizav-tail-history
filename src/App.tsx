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
 * Description: Application root — provider shell with QueryClient, MUI Theme, and Router
 */
import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {StyledEngineProvider, ThemeProvider, CssBaseline} from '@mui/material';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import theme from './theme/Theme';
import {queryClient} from './utils/useFetch';
import TailHistoryPage from './pages/tailHistory/TailHistoryPage';

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/tail-history/:tailId" element={<TailHistoryPage />} />
            <Route path="*" element={<Navigate replace to="/tail-history/demo" />} />
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </StyledEngineProvider>
  </QueryClientProvider>
);

export default App;
