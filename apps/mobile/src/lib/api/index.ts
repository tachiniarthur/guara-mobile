/**
 * Data access entry point. Features call `apiRequest`/`apiStream` (usually through TanStack
 * hooks) against the NestJS API (`EXPO_PUBLIC_API_URL`).
 */
import type { ApiRequestArgs, EndpointName, StreamEndpointName, StreamRequest } from '@guara/types';

import { env } from '../env';

import { createHttpTransport } from './http-transport';
import type { ApiTransport, RequestOptions, StreamOptions } from './transport';
import { createApiTransport } from './validation';

export * from './auth';
export * from './errors';
export { createHttpTransport, toQueryString } from './http-transport';
export type * from './transport';
export { ContractViolationError, createApiTransport } from './validation';

function createDefaultTransport(): ApiTransport {
  return createApiTransport(createHttpTransport({ baseUrl: env.apiUrl }));
}

let current: ApiTransport | null = null;

export function getTransport(): ApiTransport {
  current ??= createDefaultTransport();
  return current;
}

/** Replaces the transport (tests). `null` goes back to the HTTP transport. */
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
