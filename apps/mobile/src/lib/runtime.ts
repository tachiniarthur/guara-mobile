import Constants, { ExecutionEnvironment } from 'expo-constants';

export type AppVariant = 'development' | 'preview' | 'production';

/**
 * True when running inside the Expo Go app. Use it to turn off features that need a
 * development build (remote push, native Google Sign-In, MMKV…).
 */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** Variant chosen by APP_VARIANT in app.config.ts. */
export const appVariant: AppVariant =
  (Constants.expoConfig?.extra?.appVariant as AppVariant | undefined) ?? 'development';
