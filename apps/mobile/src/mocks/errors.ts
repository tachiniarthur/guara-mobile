import type { ApiErrorCode } from '@guara/types';

import { ApiError, STATUS_BY_CODE } from '@/lib/api/errors';

/** Builds the `ApiError` the real API would send for `code`. */
export function mockError(code: ApiErrorCode, message?: string, details?: unknown): ApiError {
  return new ApiError(code, message, STATUS_BY_CODE[code], details);
}

export function notFound(message: string): ApiError {
  return mockError('not_found', message);
}
