import type {
  ApiParsedRequest,
  ApiResponseInput,
  EndpointName,
  StreamEndpointName,
  StreamEndpoints,
} from '@guara/types';
import type { z } from 'zod';

/** Shared state handed to every handler. */
export interface MockContext<Db = unknown> {
  db: Db;
  /** Clock of the fake world. Handlers never read the device time. */
  now: Date;
}

/**
 * Resolves one endpoint. Receives the request already validated by the contract schemas
 * (like the API would) and returns the wire shape; the transport validates the response.
 * Throw `ApiError` (see `../errors.ts`) for failures.
 */
export type MockHandler<N extends EndpointName, Db = unknown> = (
  request: ApiParsedRequest<N>,
  context: MockContext<Db>,
) => ApiResponseInput<N> | Promise<ApiResponseInput<N>>;

export type MockHandlers<Db = unknown> = { [N in EndpointName]: MockHandler<N, Db> };

type StreamParsedRequest<N extends StreamEndpointName> = {
  [
    K in 'params' | 'body' as K extends keyof StreamEndpoints[N] ? K : never
  ]: StreamEndpoints[N][K] extends z.ZodType ? z.output<StreamEndpoints[N][K]> : never;
};

export type StreamEmit<N extends StreamEndpointName> = (
  event: z.input<StreamEndpoints[N]['event']>,
) => Promise<void>;

export type MockStreamHandler<N extends StreamEndpointName, Db = unknown> = (
  request: StreamParsedRequest<N>,
  context: MockContext<Db> & { emit: StreamEmit<N>; signal?: AbortSignal },
) => Promise<void>;

export type MockStreamHandlers<Db = unknown> = {
  [N in StreamEndpointName]: MockStreamHandler<N, Db>;
};
