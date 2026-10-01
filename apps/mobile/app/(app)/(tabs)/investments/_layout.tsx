import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme/navigation';

export default function TabStackLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
