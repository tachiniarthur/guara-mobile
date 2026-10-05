import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme/navigation';

export default function TabStackLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
