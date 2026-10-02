import type { ApiErrorCode, ApiError as ApiErrorBody } from '@guara/types';

/** pt-BR messages used when the API does not send one (or the request never reached it). */
export const DEFAULT_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  bad_request: 'Não foi possível concluir o pedido.',
  validation_failed: 'Alguns dados estão inválidos. Confira e tente de novo.',
  unauthorized: 'Sua sessão expirou. Entre de novo.',
  forbidden: 'Você não tem permissão para fazer isso.',
  not_found: 'Não encontramos o que você procurava.',
  conflict: 'Isso já existe ou foi alterado em outro lugar.',
  plan_limit_reached: 'Você atingiu o limite do seu plano.',
  rate_limited: 'Muitas tentativas seguidas. Espere um pouco e tente de novo.',
  internal: 'Algo deu errado do nosso lado. Tente de novo em instantes.',
  unavailable: 'O serviço está indisponível no momento. Tente de novo em instantes.',
  timeout: 'O servidor demorou para responder. Tente de novo.',
  network: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
};

/** Codes worth an automatic retry (TanStack Query). */
const RETRYABLE: readonly ApiErrorCode[] = ['network', 'internal', 'unavailable'];

/**
 * Every failure of an API call becomes an `ApiError`, whatever the transport (HTTP or mock).
 * `message` is pt-BR and safe to show to the user.
 */
export class ApiError extends Error implements ApiErrorBody {
  constructor(
    readonly code: ApiErrorCode,
    message: string = DEFAULT_ERROR_MESSAGES[code],
    /** HTTP status; `null` when the request never got an answer (network, timeout). */
    readonly status: number | null = null,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isClientError(): boolean {
    return this.status !== null && this.status >= 400 && this.status < 500;
  }

  get isRetryable(): boolean {
    return RETRYABLE.includes(this.code);
  }

  toJSON(): ApiErrorBody {
    return { code: this.code, message: this.message, details: this.details };
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 400) return 'bad_request';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 408) return 'timeout';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation_failed';
  if (status === 429) return 'rate_limited';
  if (status === 503) return 'unavailable';
  return status >= 500 ? 'internal' : 'bad_request';
}

/** HTTP status the API uses for each code (used by the mock transport). */
export const STATUS_BY_CODE: Record<ApiErrorCode, number | null> = {
  bad_request: 400,
  validation_failed: 422,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  plan_limit_reached: 403,
  rate_limited: 429,
  internal: 500,
  unavailable: 503,
  timeout: null,
  network: null,
};

/** True when the caller aborted the request (screen left, query cancelled). */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}
