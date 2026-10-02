import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { setTransport } from '@/lib/api';
import { resetMockData, setMockScenario, useMockConfig, type MockScenarioName } from '@/mocks';

/** Fresh client per test: no retries, nothing garbage-collected mid-test. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

export function createWrapper(queryClient = createTestQueryClient()) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { queryClient, wrapper: Wrapper };
}

/** Fresh fake data for each test, served by the transport chosen by the env (mock). */
export function useFreshMocks(scenario: MockScenarioName = 'complete') {
  beforeEach(() => {
    setTransport(null);
    useMockConfig.setState({ latencyMs: 0, errorRate: 0 });
    setMockScenario(scenario);
    resetMockData();
  });
}

export function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
