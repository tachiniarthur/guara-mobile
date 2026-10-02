import { Redirect } from 'expo-router';

import type { DataPanelScreen as DataPanelScreenType } from '@/dev/data-panel';

/**
 * Dev-only controls of the fake data layer. Same pattern as `/ui`: the
 * `__DEV__ ? require() : null` form drops the panel (and src/mocks) from production bundles,
 * and the route is guarded by Stack.Protected in the root layout.
 */
const DataPanelScreen: typeof DataPanelScreenType | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional dev-only load
    (require('@/dev/data-panel') as { DataPanelScreen: typeof DataPanelScreenType }).DataPanelScreen
  : null;

export default function DataPanelRoute() {
  if (!DataPanelScreen) return <Redirect href="/" />;
  return <DataPanelScreen />;
}
