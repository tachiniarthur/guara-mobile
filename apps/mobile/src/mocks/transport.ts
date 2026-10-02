/**
 * In-memory transport: resolves each endpoint of the contract with a handler, adding
 * configurable latency, random errors and scenario-defined failures.
 */
import {
  endpoints,
  streamEndpoints,
  type ApiErrorCode,
  type EndpointName,
  type StreamEndpointName,
} from '@guara/types';
import { type z } from 'zod';

import type { RawRequest, RawTransport } from '@/lib/api/transport';

import type { MockConfig } from './config';
import { mockError } from './errors';
import type { MockContext, MockHandlers, MockStreamHandlers } from './handlers/types';

/** Failure forced by a scenario: an error code (with optional message) or a hanging request. */
export type MockFailure = { code: Exclude<ApiErrorCode, 'timeout'>; message?: string } | 'timeout';

export interface MockTransportOptions<Db> {
  handlers: Partial<MockHandlers<Db>>;
  streamHandlers?: Partial<MockStreamHandlers<Db>>;
  getConfig: () => Pick<MockConfig, 'latencyMs' | 'errorRate' | 'timeoutMs'>;
  getContext: () => MockContext<Db>;
  getFailure?: (name: EndpointName | StreamEndpointName) => MockFailure | undefined;
  /** Source of randomness for `errorRate` (injectable in tests). */
  random?: () => number;
}

function abortError(): Error {
  const error = new Error('The request was aborted');
  error.name = 'AbortError';
  return error;
}

/** Waits `ms`, rejecting with an AbortError if the signal fires first. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Validates a request part like the API would (422 with the issues). */
function parsePart(schema: z.ZodType | undefined, value: unknown, part: string): unknown {
  if (!schema) return undefined;
  const result = schema.safeParse(value ?? (part === 'body' ? undefined : {}));
  if (result.success) return result.data;
  throw mockError('validation_failed', undefined, {
    part,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  });
}

/** JSON round trip: callers never share references with the in-memory store. */
function toWire<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

export function createMockTransport<Db>({
  handlers,
  streamHandlers = {},
  getConfig,
  getContext,
  getFailure = () => undefined,
  random = Math.random,
}: MockTransportOptions<Db>): RawTransport {
  async function simulateNetwork(name: EndpointName | StreamEndpointName, signal?: AbortSignal) {
    const { latencyMs, errorRate, timeoutMs } = getConfig();
    if (latencyMs > 0) await sleep(latencyMs, signal);

    const failure = getFailure(name);
    if (failure === 'timeout') {
      await sleep(timeoutMs, signal);
      throw mockError('timeout');
    }
    if (failure) throw mockError(failure.code, failure.message);
    if (errorRate > 0 && random() < errorRate) throw mockError('unavailable');
  }

  return {
    kind: 'mock',

    async request(name, request: RawRequest, { signal }) {
      await simulateNetwork(name, signal);
      const handler = handlers[name] as
        ((request: unknown, context: MockContext<Db>) => unknown) | undefined;
      if (!handler) throw mockError('not_found', `Endpoint sem dados falsos: ${name}`);

      const def = endpoints[name] as {
        params?: z.ZodType;
        query?: z.ZodType;
        body?: z.ZodType;
      };
      const parsed = {
        params: parsePart(def.params, request.params, 'params'),
        query: parsePart(def.query, request.query, 'query'),
        body: parsePart(def.body, request.body, 'body'),
      };
      return toWire(await handler(parsed, getContext()));
    },

    async stream(name, request: RawRequest, { signal, onEvent }) {
      await simulateNetwork(name, signal);
      const handler = streamHandlers[name] as
        ((request: unknown, context: unknown) => Promise<void>) | undefined;
      if (!handler) throw mockError('not_found', `Endpoint sem dados falsos: ${name}`);

      const def = streamEndpoints[name];
      const parsed = {
        params: parsePart(def.params, request.params, 'params'),
        body: parsePart(def.body, request.body, 'body'),
      };
      await handler(parsed, {
        ...getContext(),
        signal,
        emit: async (event: unknown) => {
          if (signal?.aborted) throw abortError();
          onEvent(toWire(event));
        },
      });
    },
  };
}
