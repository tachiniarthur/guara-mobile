/**
 * Data access entry point. Features call `apiRequest`/`apiStream` (usually through TanStack
 * hooks) and never know whether the data is fake or real.
 *
 * EXPO_PUBLIC_DATA_SOURCE picks the transport (see `env.ts`). The mock transport is loaded
 * with `__DEV__ ? require() : null`, so Metro removes `src/mocks` from production bundles.
 */
import type { ApiRequestArgs, EndpointName, StreamEndpointName, StreamRequest } from '@guara/types';

import type * as Mocks from '@/mocks';

import { env } from '../env';

import { createHttpTransport } from './http-transport';
import type { ApiTransport, RequestOptions, StreamOptions } from './transport';
import { createApiTransport } from './validation';

export * from './auth';
export * from './errors';
export { createHttpTransport, toQueryString } from './http-transport';
export type * from './transport';
export { ContractViolationError, createApiTransport } from './validation';

const loadMocks: (() => typeof Mocks) | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional dev-only load
    () => require('@/mocks') as typeof Mocks
  : null;

function createDefaultTransport(): ApiTransport {
  if (env.dataSource === 'mock') {
    if (!loadMocks) throw new Error('Mock data is only available in development builds.');
    return createApiTransport(loadMocks().createMockTransport());
  }
  return createApiTransport(createHttpTransport({ baseUrl: env.apiUrl }));
}

let current: ApiTransport | null = null;

export function getTransport(): ApiTransport {
  current ??= createDefaultTransport();
  return current;
}

/** Replaces the transport (tests). `null` goes back to the one chosen by the env. */
export function setTransport(transport: ApiTransport | null): void {
  current = transport;
}

/** Calls a JSON endpoint of the contract through the current transport. */
export function apiRequest<N extends EndpointName>(
  name: N,
  ...args: ApiRequestArgs<N, RequestOptions>
) {
  return getTransport().request(name, ...args);
}

/** Calls a streaming (SSE) endpoint of the contract through the current transport. */
export function apiStream<N extends StreamEndpointName>(
  name: N,
  request: StreamRequest<N>,
  options: StreamOptions<N>,
) {
  return getTransport().stream(name, request, options);
}
