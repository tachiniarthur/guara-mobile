/**
 * Thin fetch wrapper for the NestJS API — the only backend the app talks to
 * (except Supabase Auth). No endpoints are called yet.
 */
import { env } from './env';

/** HTTP error returned by the API (NestJS error shape: { statusCode, message, error }). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

/** The request never reached the API (offline, DNS, timeout…). */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed', { cause });
    this.name = 'NetworkError';
  }
}

type AccessTokenProvider = () => Promise<string | null> | string | null;

let accessTokenProvider: AccessTokenProvider = () => null;

/** Called by AuthProvider so requests carry the current Supabase access token. */
export function setAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await accessTokenProvider();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type QueryValue = string | number | boolean | null | undefined;

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${env.apiUrl}/${path.replace(/^\/+/, '')}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length ? `${url}?${params.join('&')}` : url;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Attach the bearer token (default: true). */
  auth?: boolean;
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: { message?: string | string[]; error?: string; code?: string } | null = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON error body.
  }
  const message = Array.isArray(payload?.message)
    ? payload.message.join('; ')
    : (payload?.message ?? response.statusText ?? 'Request failed');
  return new ApiError(response.status, message, payload?.code ?? payload?.error, payload);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, query, auth = true, headers, ...init } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? await getAuthHeaders() : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new NetworkError(error);
  }

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'body' | 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, 'body' | 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
