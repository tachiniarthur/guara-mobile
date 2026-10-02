/**
 * The only way features reach data. Two implementations sit behind it — HTTP (NestJS API)
 * and in-memory mocks — chosen by EXPO_PUBLIC_DATA_SOURCE; screens never know which one.
 */
import type {
  ApiRequestArgs,
  ApiResponse,
  EndpointName,
  StreamEndpointName,
  StreamEvent,
  StreamRequest,
} from '@guara/types';

export interface RequestOptions {
  signal?: AbortSignal;
}

export interface StreamOptions<N extends StreamEndpointName> {
  signal?: AbortSignal;
  onEvent: (event: StreamEvent<N>) => void;
}

export type TransportKind = 'http' | 'mock';

/** Typed client of the contract in `@guara/types`. Every failure is an `ApiError`. */
export interface ApiTransport {
  readonly kind: TransportKind;
  request<N extends EndpointName>(
    name: N,
    ...args: ApiRequestArgs<N, RequestOptions>
  ): Promise<ApiResponse<N>>;
  /** Resolves when the stream ends. Events are validated before `onEvent`. */
  stream<N extends StreamEndpointName>(
    name: N,
    request: StreamRequest<N>,
    options: StreamOptions<N>,
  ): Promise<void>;
}

/** Request parts as plain data, already split from the options. */
export interface RawRequest {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
}

/**
 * What an implementation provides: untyped, unvalidated data. `createApiTransport` wraps
 * it with the contract types and the response validation.
 */
export interface RawTransport {
  readonly kind: TransportKind;
  request(name: EndpointName, request: RawRequest, options: RequestOptions): Promise<unknown>;
  stream(
    name: StreamEndpointName,
    request: RawRequest,
    options: { signal?: AbortSignal; onEvent: (event: unknown) => void },
  ): Promise<void>;
}
