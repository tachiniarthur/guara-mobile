/** Transport for the NestJS API. No endpoint exists yet; nothing calls it in this phase. */
import {
  ApiErrorSchema,
  buildPath,
  endpoints,
  streamEndpoints,
  type EndpointDef,
  type StreamEndpointDef,
} from '@guara/types';

import { streamSSE } from '../sse';

import { getAuthHeaders } from './auth';
import { ApiError, codeFromStatus, isAbortError } from './errors';
import type { RawRequest, RawTransport } from './transport';

export interface HttpTransportOptions {
  /** API base URL without trailing slash (`env.apiUrl`). */
  baseUrl: string;
  timeoutMs?: number;
  getHeaders?: () => Promise<Record<string, string>>;
  fetch?: typeof fetch;
}

const DEFAULT_TIMEOUT_MS = 15_000;

export function toQueryString(query: Record<string, unknown> | undefined): string {
  if (!query) return '';
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length ? `?${params.join('&')}` : '';
}

function buildUrl(baseUrl: string, def: EndpointDef | StreamEndpointDef, request: RawRequest) {
  return `${baseUrl}${buildPath(def.path, request.params)}${toQueryString(request.query)}`;
}

/** Maps a non-2xx response to `ApiError`, using the API body when it follows the contract. */
export async function errorFromResponse(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON error body (proxy, gateway…).
  }
  const parsed = ApiErrorSchema.safeParse(body);
  if (parsed.success) {
    const { code, message, details } = parsed.data;
    return new ApiError(code, message, response.status, details);
  }
  return new ApiError(codeFromStatus(response.status), undefined, response.status);
}

/** Aborts on the caller's signal or after `timeoutMs`, telling both cases apart. */
function withTimeout(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', onAbort);
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    dispose: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

export function createHttpTransport({
  baseUrl,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  getHeaders = getAuthHeaders,
  fetch: fetchFn = fetch,
}: HttpTransportOptions): RawTransport {
  return {
    kind: 'http',

    async request(name, request, { signal }) {
      const def = endpoints[name];
      const hasBody = request.body !== undefined;
      const abort = withTimeout(signal, timeoutMs);
      let response: Response;
      try {
        response = await fetchFn(buildUrl(baseUrl, def, request), {
          method: def.method,
          headers: {
            Accept: 'application/json',
            ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
            ...(await getHeaders()),
          },
          body: hasBody ? JSON.stringify(request.body) : undefined,
          signal: abort.signal,
        });
      } catch (error) {
        if (abort.timedOut()) throw new ApiError('timeout');
        if (isAbortError(error)) throw error;
        throw new ApiError('network', undefined, null, { cause: String(error) });
      } finally {
        abort.dispose();
      }

      if (!response.ok) throw await errorFromResponse(response);
      if (response.status === 204) return undefined;
      return response.json();
    },

    async stream(name, request, { signal, onEvent }) {
      const def = streamEndpoints[name];
      try {
        await streamSSE(buildUrl(baseUrl, def, request), {
          method: def.method,
          headers: await getHeaders(),
          body: request.body,
          signal,
          onResponseError: errorFromResponse,
          onMessage: ({ data }) => onEvent(JSON.parse(data)),
        });
      } catch (error) {
        if (error instanceof ApiError || isAbortError(error)) throw error;
        throw new ApiError('network', undefined, null, { cause: String(error) });
      }
    },
  };
}
