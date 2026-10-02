import { QueryClient } from '@tanstack/react-query';

import type { QueryRoot } from '@/constants/query-keys';

import { ApiError } from './api/errors';

const MAX_RETRIES = 2;

/** How long each kind of data stays fresh before a background refetch. */
export const STALE_TIME = {
  /** Market quotes and price series. */
  quotes: 15_000,
  /** Badge counters and other near-real-time data. */
  live: 15_000,
  /** Lists and details that change with the user's activity (default). */
  standard: 30_000,
  /** Aggregates that change slowly: reports, wealth evolution, allocation. */
  analytics: 5 * 60_000,
  /** Profile, plan, preferences and investor profile. */
  profile: 30 * 60_000,
  /** Fixed lists (categories). */
  static: Infinity,
} as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.standard,
        gcTime: 5 * 60_000,
        // Only transient failures (network, 500, 503) are retried; 4xx, timeouts and contract
        // violations are not.
        retry: (failureCount, error) =>
          error instanceof ApiError && error.isRetryable && failureCount < MAX_RETRIES,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Marks every query of the given domains as stale (and refetches the active ones). */
export function invalidateRoots(queryClient: QueryClient, roots: readonly QueryRoot[]) {
  return Promise.all(roots.map((root) => queryClient.invalidateQueries({ queryKey: [root] })));
}
