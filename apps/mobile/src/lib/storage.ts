/**
 * Local persistence behind app-owned interfaces, so implementations can be swapped
 * (e.g. expo-sqlite/kv-store → react-native-mmkv on the development build) without
 * touching features. Features must import from here, never from the libraries.
 */
import * as SecureStore from 'expo-secure-store';
import { SQLiteStorage } from 'expo-sqlite/kv-store';

/** Synchronous key-value storage for cache and preferences (non-sensitive data). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

/** Asynchronous encrypted storage for session data and tokens. */
export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// --- Key-value (expo-sqlite/kv-store; included in Expo Go) -------------------------------

const kvDatabase = new SQLiteStorage('guara-kv.db');

export const kvStorage: KeyValueStorage = {
  getItem: (key) => kvDatabase.getItemSync(key),
  setItem: (key, value) => kvDatabase.setItemSync(key, value),
  removeItem: (key) => {
    kvDatabase.removeItemSync(key);
  },
  clear: () => {
    kvDatabase.clearSync();
  },
};

/** JSON helpers on top of `kvStorage`. Corrupted values are treated as missing. */
export function getJSON<T>(key: string): T | null {
  const raw = kvStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    kvStorage.removeItem(key);
    return null;
  }
}

export function setJSON(key: string, value: unknown): void {
  kvStorage.setItem(key, JSON.stringify(value));
}

// --- Secure storage (expo-secure-store) ----------------------------------------------------

/**
 * SecureStore warns above ~2 KB per value and Supabase sessions can be larger,
 * so values are split into chunks: `<key>.n` holds the count, `<key>.0..n-1` the parts.
 */
const CHUNK_SIZE = 1800;
const countKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, index: number) => `${key}.${index}`;

async function removeChunks(key: string): Promise<void> {
  const count = Number(await SecureStore.getItemAsync(countKey(key)));
  await Promise.all(
    Array.from({ length: Number.isFinite(count) ? count : 0 }, (_, index) =>
      SecureStore.deleteItemAsync(chunkKey(key, index)),
    ),
  );
  await SecureStore.deleteItemAsync(countKey(key));
}

export const secureStorage: SecureStorage = {
  async getItem(key) {
    const countValue = await SecureStore.getItemAsync(countKey(key));
    if (countValue === null) return null;
    const parts = await Promise.all(
      Array.from({ length: Number(countValue) }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, index)),
      ),
    );
    return parts.some((part) => part === null) ? null : parts.join('');
  },
  async setItem(key, value) {
    await removeChunks(key);
    const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
    for (let index = 0; index < count; index++) {
      const part = value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(chunkKey(key, index), part);
    }
    await SecureStore.setItemAsync(countKey(key), String(count));
  },
  removeItem: removeChunks,
};
