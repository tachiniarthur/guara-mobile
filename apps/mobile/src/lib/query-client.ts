import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api/errors';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
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
