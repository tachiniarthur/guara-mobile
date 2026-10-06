const path = require('node:path');
const { defineConfig } = require('eslint/config');
const expoConfig = require('@guara/eslint-config/expo');

/**
 * Storage, auth and notification libraries may only be imported inside `src/lib/`.
 * This keeps the future migration to a development build (MMKV, native Google
 * Sign-In, remote push…) confined to that folder.
 */
const INFRA_ONLY_PACKAGES = [
  'expo-sqlite',
  'expo-sqlite/kv-store',
  'expo-secure-store',
  '@supabase/supabase-js',
  'expo-auth-session',
  'expo-apple-authentication',
  'expo-web-browser',
  'expo-notifications',
  'expo-image-picker',
].map((name) => ({ name, message: 'Use the wrappers in src/lib/ instead.' }));

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['expo-env.d.ts', '.expo/**', 'android/**', 'ios/**', 'coverage/**'],
  },
  {
    // Resolve `@/` aliases from this app's tsconfig even when ESLint runs from the repo root
    // (lint-staged).
    settings: {
      'import/resolver': {
        typescript: { project: path.join(__dirname, 'tsconfig.json') },
      },
    },
  },
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: ['src/lib/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: INFRA_ONLY_PACKAGES }],
    },
  },
]);
