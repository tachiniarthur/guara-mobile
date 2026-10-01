import '../global.css';

import { colors } from '@guara/ui-tokens';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AppProviders, useAuth } from '@/providers';

export { ErrorBoundary } from 'expo-router';

// Splash appearance comes from the expo-splash-screen plugin in app.config.ts
// (`SplashScreen.setOptions` is not available in Expo Go).
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

/**
 * Chooses the area from the session status (see `devSession` in src/providers/AuthProvider.tsx).
 * Guarded groups are unreachable; deep links into them fall back to the allowed area.
 */
function RootNavigator() {
  const { status } = useAuth();
  // Register custom fonts from assets/fonts here when they are added.
  const [fontsLoaded, fontError] = useFonts({});
  const ready = status !== 'loading' && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.DEFAULT },
      }}
    >
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'onboarding'}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
