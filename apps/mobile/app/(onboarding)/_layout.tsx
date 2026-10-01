import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme/navigation';

/** Steps: connect banks (skippable) → investor profile (can answer later) → assistants. */
export const unstable_settings = { initialRouteName: 'connect-banks' };

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="connect-banks" options={{ headerShown: false }} />
    </Stack>
  );
}
