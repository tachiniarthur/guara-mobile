/**
 * Public runtime configuration, validated with zod.
 *
 * ⚠️ NO SECRET KEYS IN THE APP. Every EXPO_PUBLIC_* variable is embedded in the JS
 * bundle and can be read by anyone who downloads the app. Claude, Malvo, Brapi and the
 * Supabase service-role key live ONLY in the NestJS API.
 *
 * Variables must be read with static `process.env.EXPO_PUBLIC_X` access (no destructuring
 * or dynamic keys) so Expo can inline them at build time.
 */
import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.preprocess(emptyToUndefined, z.url().default('http://localhost:3000')),
  EXPO_PUBLIC_SUPABASE_URL: z.preprocess(emptyToUndefined, z.url().optional()),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
});

export type RawEnv = Partial<Record<keyof z.input<typeof envSchema>, string | undefined>>;

/** Validates the raw variables. Pure, so the rules can be tested. */
export function parseEnv(raw: RawEnv) {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables (see apps/mobile/.env.example):\n${z.prettifyError(parsed.error)}`,
    );
  }

  return Object.freeze({
    /** Base URL of the NestJS API, without trailing slash. */
    apiUrl: parsed.data.EXPO_PUBLIC_API_URL.replace(/\/+$/, ''),
    supabaseUrl: parsed.data.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.data.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export const env = parseEnv({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

export type Env = typeof env;
