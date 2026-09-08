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
 * Description: State definitions for the IP History chart stakeholder review pages.
 */

export interface IpHistoryReviewState {
  id: number;
  label: string;
  description: string;
  chartState: 'loading' | 'error' | 'empty' | 'populated';
}

export const IP_HISTORY_REVIEW_STATES: IpHistoryReviewState[] = [
  {
    id: 1,
    label: 'Loading',
    description: 'Skeleton placeholder shown while IP history data is being fetched.',
    chartState: 'loading'
  },
  {
    id: 2,
    label: 'Error',
    description: 'Error banner displayed when the IP history data fetch fails.',
    chartState: 'error'
  },
  {
    id: 3,
    label: 'Empty',
    description: '"No IP history data available" message shown when there are no events.',
    chartState: 'empty'
  },
  {
    id: 4,
    label: 'Populated',
    description: 'Full chart with 14 days of IP history across Transmit, Receive, and TPA roles.',
    chartState: 'populated'
  }
];
