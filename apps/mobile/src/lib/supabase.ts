/**
 * Supabase client — used ONLY for authentication (Google, Apple, e-mail).
 * All data goes through the NestJS API. The session is kept in encrypted storage.
 */
import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, type NativeEventSubscription } from 'react-native';

import { env } from './env';
import { secureStorage } from './storage';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/** Lazily creates the client. Throws a clear error while the env vars are not set. */
export function getSupabase(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured: set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  client ??= createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage: secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
  return client;
}

/**
 * Refreshes tokens only while the app is in the foreground (recommended by Supabase
 * for React Native). Returns an unsubscribe function.
 */
export function registerSupabaseAutoRefresh(): () => void {
  if (!isSupabaseConfigured()) return () => {};
  const supabase = getSupabase();
  const subscription: NativeEventSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
  return () => subscription.remove();
}
