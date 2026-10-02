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

import { appVariant, type AppVariant } from './runtime';

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

/**
 * Where the data comes from: `mock` (in-memory fake data, development only) or `api` (NestJS).
 * Defaults to `mock` in development and `api` everywhere else.
 */
export const DATA_SOURCES = ['mock', 'api'] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.preprocess(emptyToUndefined, z.url().default('http://localhost:3000')),
  EXPO_PUBLIC_SUPABASE_URL: z.preprocess(emptyToUndefined, z.url().optional()),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  EXPO_PUBLIC_DATA_SOURCE: z.preprocess(emptyToUndefined, z.enum(DATA_SOURCES).optional()),
});

export type RawEnv = Partial<Record<keyof z.input<typeof envSchema>, string | undefined>>;

export interface EnvContext {
  variant: AppVariant;
  /** `__DEV__`: mocks only exist in development bundles. */
  isDev: boolean;
}

/** Validates the raw variables. Pure, so the rules can be tested for every variant. */
export function parseEnv(raw: RawEnv, { variant, isDev }: EnvContext) {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables (see apps/mobile/.env.example):\n${z.prettifyError(parsed.error)}`,
    );
  }

  const dataSource: DataSource = parsed.data.EXPO_PUBLIC_DATA_SOURCE ?? (isDev ? 'mock' : 'api');
  if (dataSource === 'mock' && variant === 'production') {
    throw new Error('EXPO_PUBLIC_DATA_SOURCE=mock is not allowed in the production variant.');
  }
  if (dataSource === 'mock' && !isDev) {
    throw new Error('EXPO_PUBLIC_DATA_SOURCE=mock only works in development builds.');
  }

  return Object.freeze({
    /** Base URL of the NestJS API, without trailing slash. */
    apiUrl: parsed.data.EXPO_PUBLIC_API_URL.replace(/\/+$/, ''),
    supabaseUrl: parsed.data.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.data.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    dataSource,
  });
}

export const env = parseEnv(
  {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_DATA_SOURCE: process.env.EXPO_PUBLIC_DATA_SOURCE,
  },
  { variant: appVariant, isDev: __DEV__ },
);

export type Env = typeof env;
