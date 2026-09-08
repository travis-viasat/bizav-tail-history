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
 * Description: React Query v5 fetch hook — adapted from insights-manager useFetch (v4 → v5)
 */
import {QueryClient, useQuery} from '@tanstack/react-query';
import type {UseQueryResult} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity // v5 rename of cacheTime (per RESEARCH.md Pitfall 2)
    }
  }
});

const LOGOUT_STATUS = 401;

export type Verb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface FetchParams {
  route: string;
  params: Record<string, any> | null; // Null means do not query yet.
  method?: Verb;
}

/**
 * Encodes query parameters for the fetch
 * @param params Query params
 * @returns URL encoded params
 */
const encodeQueryParams = (params: Record<string, any>): string =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

/**
 * Perform fetch with appropriate headers
 * @param fetchParams Fetch parameters
 * @param signal AbortSignal for query cancellation
 * @returns Fetch response or null
 */
export const queryWithHeaders = async (
  {route, method = 'GET', params}: FetchParams,
  signal?: AbortSignal
): Promise<Response | null> => {
  // This should never happen
  if (!params) return null;

  return await fetch(
    method === 'GET' && Object.keys(params).length > 0 ? `${route}?${encodeQueryParams(params)}` : route,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
      },
      body: method !== 'GET' ? JSON.stringify(params) : undefined,
      signal
    }
  );
};

/**
 * Query function for React Query
 * @param fetchParams Fetch parameters
 * @param signal Abort signal
 * @returns JSON data if successful
 */
const queryFn = async (fetchParams: FetchParams, signal?: AbortSignal): Promise<any> => {
  const response = await queryWithHeaders(fetchParams, signal);
  if (!response) return null;

  if (response.status === LOGOUT_STATUS) {
    // 401 received — propagate as error; parent app handles auth redirect
    throw new Error(`Received response status: ${response.status}`);
  } else if (response.status >= 300) {
    throw new Error(`Received response status: ${response.status}`);
  }

  return await response.json();
};

/**
 * React Query v5 fetch hook
 * @param fetchParams Fetch parameters (null params disables the query)
 * @param transform Optional transform function applied to response data
 * @returns UseQueryResult
 */
const useFetch = <Data>(
  fetchParams: FetchParams,
  transform?: ((data: any) => Data) | null
): UseQueryResult<Data, any> => {
  const enabled = Boolean(fetchParams.params);
  const queryKey = [fetchParams.route, fetchParams.params];

  // Remove stale queries with the same route but different params to prevent
  // infinite cache growth (cache is set to Infinity)
  if (enabled && !queryClient.getQueryState(queryKey)) {
    queryClient.removeQueries({queryKey: [fetchParams.route], exact: false});
  }

  return useQuery({
    queryKey,
    select: transform ?? undefined,
    queryFn: async context => await queryFn(fetchParams, context.signal),
    enabled,
    staleTime: Infinity,
    gcTime: Infinity, // v5 rename of cacheTime
    refetchIntervalInBackground: true
  });
};

export default useFetch;
