import { Redirect } from 'expo-router';

import { UiCatalogScreen } from '@/dev/ui-catalog';

/** Dev-only component catalog. Also guarded by Stack.Protected in the root layout. */
export default function UiCatalogRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <UiCatalogScreen />;
}
