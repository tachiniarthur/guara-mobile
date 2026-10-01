/* Global test setup (jest-expo preset). RNTL 13+ registers its matchers automatically. */
import 'react-native-gesture-handler/jestSetup';

// Official mocks for animation-heavy libraries (Reanimated 4 runs on react-native-worklets).
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));

// In-memory replacements for native storage modules.
jest.mock('expo-sqlite/kv-store', () => {
  class SQLiteStorage {
    private store = new Map<string, string>();
    getItemSync = (key: string) => this.store.get(key) ?? null;
    setItemSync = (key: string, value: string) => void this.store.set(key, value);
    removeItemSync = (key: string) => this.store.delete(key);
    clearSync = () => {
      this.store.clear();
      return true;
    };
  }
  return { SQLiteStorage, default: new SQLiteStorage() };
});

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
  };
});

// Always online in tests.
jest.mock('expo-network', () => ({
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
  useNetworkState: jest.fn(() => ({ isConnected: true, isInternetReachable: true })),
  getNetworkStateAsync: jest.fn(async () => ({ isConnected: true, isInternetReachable: true })),
}));
