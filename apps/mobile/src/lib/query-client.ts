import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api-client';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        // 4xx errors won't change on retry; network/5xx errors get a couple of retries.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.isClientError) && failureCount < MAX_RETRIES,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
