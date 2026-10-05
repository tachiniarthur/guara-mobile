import type React from 'react';
import type * as ReactNative from 'react-native';

/* Global test setup (jest-expo preset). RNTL 13+ registers its matchers automatically. */
import 'react-native-gesture-handler/jestSetup';

// Official mocks for animation-heavy libraries (Reanimated 4 runs on react-native-worklets).
jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => jest.requireActual('react-native-reanimated/mock'));
jest.mock('@gorhom/bottom-sheet', () => jest.requireActual('@gorhom/bottom-sheet/mock'));

// Safe-area hooks work without a provider (official mock, fixed metrics).
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);

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

// Skia draws on the GPU; in Jest the canvas becomes a View and drawing calls are no-ops.
jest.mock('@shopify/react-native-skia', () => {
  const { createElement } = jest.requireActual<typeof React>('react');
  const { View } = jest.requireActual<typeof ReactNative>('react-native');
  const makePath = () => {
    const path: Record<string, () => unknown> = {};
    for (const method of ['addCircle', 'moveTo', 'lineTo', 'close', 'reset', 'addOval']) {
      path[method] = () => path;
    }
    path.detach = () => ({});
    path.build = () => ({});
    return path;
  };
  const Noop = () => null;
  return {
    Canvas: (props: object) => createElement(View, props),
    Circle: Noop,
    DashPathEffect: Noop,
    Group: Noop,
    Path: Noop,
    RadialGradient: Noop,
    Skia: { Path: { Make: makePath }, PathBuilder: { Make: makePath } },
    vec: (x: number, y: number) => ({ x, y }),
  };
});

// FlashList measures its cells natively; in tests every item renders in a plain ScrollView.
jest.mock('@shopify/flash-list', () => {
  const { createElement, Fragment, isValidElement } = jest.requireActual<typeof React>('react');
  const { ScrollView } = jest.requireActual<typeof ReactNative>('react-native');
  type MockSlot = React.ComponentType | React.ReactElement | null | undefined;
  const slot = (value: MockSlot) =>
    !value ? null : isValidElement(value) ? value : createElement(value as React.ComponentType);
  function FlashList<T>({
    data,
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
  }: {
    data: readonly T[] | null | undefined;
    renderItem: (info: { item: T; index: number }) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => string;
    ListHeaderComponent?: MockSlot;
    ListFooterComponent?: MockSlot;
    ListEmptyComponent?: MockSlot;
  }) {
    const items = data ?? [];
    return createElement(
      ScrollView,
      null,
      slot(ListHeaderComponent),
      items.length === 0
        ? slot(ListEmptyComponent)
        : items.map((item, index) =>
            createElement(
              Fragment,
              { key: keyExtractor ? keyExtractor(item, index) : String(index) },
              renderItem({ item, index }),
            ),
          ),
      slot(ListFooterComponent),
    );
  }
  return { FlashList };
});
