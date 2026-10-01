import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme/navigation';

export const unstable_settings = { initialRouteName: '(tabs)' };

/** Authenticated area: tabs + pushed screens + everything under (modals) as a modal. */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        ...stackScreenOptions,
        ...(route.name.startsWith('(modals)/') ? { presentation: 'modal' as const } : null),
      })}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
