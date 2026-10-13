/**
 * Sign-in and sign-up with a 6-digit code sent by e-mail (Supabase OTP). There is no password:
 * the code proves the e-mail. In development without Supabase (empty env), every request and
 * code is accepted so the flow can be tried in Expo Go; in production that is an error.
 */
import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import { logger } from './logger';
import { getSupabase, isSupabaseConfigured } from './supabase';

/**
 * `no-account`: no account with the e-mail (sign-in only). `invalid`: wrong or old code (the
 * screen tells them apart by the time). `rate-limited`: too many codes in a short time.
 */
export type EmailAuthErrorCode =
  'no-account' | 'invalid' | 'rate-limited' | 'network' | 'unavailable';

export class EmailAuthError extends Error {
  constructor(readonly code: EmailAuthErrorCode) {
    super(`E-mail sign-in failed: ${code}`);
    this.name = 'EmailAuthError';
  }
}

export const isEmailAuthError = (error: unknown): error is EmailAuthError =>
  error instanceof EmailAuthError;

function toEmailAuthError(error: unknown): EmailAuthError {
  if (isAuthRetryableFetchError(error)) return new EmailAuthError('network');
  if (isAuthApiError(error)) {
    if (error.code === 'otp_disabled' || error.code === 'signup_disabled') {
      return new EmailAuthError('no-account');
    }
    if (error.code === 'otp_expired') return new EmailAuthError('invalid');
    if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
      return new EmailAuthError('rate-limited');
    }
  }
  logger.error('Unexpected e-mail auth error', { error });
  return new EmailAuthError('unavailable');
}

/** Without Supabase only development goes on (any code works); production stops here. */
function devFallback(): boolean {
  if (isSupabaseConfigured()) return false;
  if (__DEV__) {
    logger.warn('Supabase is not configured: e-mail codes are simulated');
    return true;
  }
  throw new EmailAuthError('unavailable');
}

/**
 * Sends a code. `createUser: false` (Entrar) fails with `no-account` for an unknown e-mail;
 * `true` (Criar conta) creates the account when the code is confirmed.
 */
export async function requestEmailCode(
  email: string,
  { createUser }: { createUser: boolean },
): Promise<void> {
  if (devFallback()) return;
  try {
    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: createUser },
    });
    if (error) throw error;
  } catch (error) {
    throw toEmailAuthError(error);
  }
}

/** Checks the 6 digits and opens the session. */
export async function verifyEmailCode(email: string, token: string): Promise<void> {
  if (devFallback()) return;
  try {
    const { error } = await getSupabase().auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
  } catch (error) {
    throw toEmailAuthError(error);
  }
}
