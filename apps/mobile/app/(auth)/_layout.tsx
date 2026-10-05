import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/theme/navigation';

export const unstable_settings = { initialRouteName: 'sign-in' };

export default function AuthLayout() {
  return <Stack screenOptions={stackScreenOptions} />;
}
