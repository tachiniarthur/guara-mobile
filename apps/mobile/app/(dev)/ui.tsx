import { Redirect } from 'expo-router';

import type { UiCatalogScreen as UiCatalogScreenType } from '@/dev/ui-catalog';

/**
 * Dev-only component catalog. The `__DEV__ ? require() : null` form lets Metro fold the
 * constant in production builds and drop the whole catalog from the bundle. The route is
 * also guarded by Stack.Protected in the root layout.
 */
const UiCatalogScreen: typeof UiCatalogScreenType | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional dev-only load
    (require('@/dev/ui-catalog') as { UiCatalogScreen: typeof UiCatalogScreenType }).UiCatalogScreen
  : null;

export default function UiCatalogRoute() {
  if (!UiCatalogScreen) return <Redirect href="/" />;
  return <UiCatalogScreen />;
}
