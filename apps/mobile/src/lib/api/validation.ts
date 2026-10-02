import {
  endpoints,
  streamEndpoints,
  type EndpointName,
  type StreamEndpointName,
} from '@guara/types';
import { z } from 'zod';

import { logger } from '../logger';

import type { ApiTransport, RawRequest, RawTransport, RequestOptions } from './transport';

/** Thrown in development/tests when a response breaks the contract. Always a bug. */
export class ContractViolationError extends Error {
  constructor(endpoint: string, error: z.ZodError) {
    super(`Response of "${endpoint}" does not match the contract:\n${z.prettifyError(error)}`);
    this.name = 'ContractViolationError';
  }
}

export interface ValidationOptions {
  /**
   * `true` (development and tests): `schema.parse` — fail loudly.
   * `false` (production): `safeParse`, log the problem and keep the app running.
   */
  strict: boolean;
}

function validate(schema: z.ZodType, data: unknown, endpoint: string, strict: boolean): unknown {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  if (strict) throw new ContractViolationError(endpoint, result.error);
  logger.error('API response does not match the contract', {
    endpoint,
    issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code })),
  });
  return data;
}

/** Adds the contract types and response validation on top of a raw transport. */
export function createApiTransport(
  raw: RawTransport,
  { strict }: ValidationOptions = { strict: __DEV__ },
): ApiTransport {
  return {
    kind: raw.kind,
    async request(name: EndpointName, request?: RawRequest & RequestOptions) {
      const { signal, ...parts } = request ?? {};
      const data = await raw.request(name, parts, { signal });
      return validate(endpoints[name].response, data, name, strict);
    },
    stream(name: StreamEndpointName, request: RawRequest, { signal, onEvent }) {
      const { event } = streamEndpoints[name];
      return raw.stream(name, request, {
        signal,
        onEvent: (data) => onEvent(validate(event, data, name, strict) as never),
      });
    },
  } as ApiTransport;
}
