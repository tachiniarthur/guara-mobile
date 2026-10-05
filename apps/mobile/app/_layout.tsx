import '../global.css';

import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_400Regular_Italic } from '@expo-google-fonts/figtree/400Regular_Italic';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { Figtree_800ExtraBold } from '@expo-google-fonts/figtree/800ExtraBold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { Fraunces_700Bold_Italic } from '@expo-google-fonts/fraunces/700Bold_Italic';
import { Fraunces_800ExtraBold } from '@expo-google-fonts/fraunces/800ExtraBold';
import { colors, fontFamily } from '@guara/ui-tokens';
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
  // Family names come from the tokens (one family per weight).
  const [fontsLoaded, fontError] = useFonts({
    [fontFamily.regular]: Figtree_400Regular,
    [fontFamily.italic]: Figtree_400Regular_Italic,
    [fontFamily.medium]: Figtree_500Medium,
    [fontFamily.semibold]: Figtree_600SemiBold,
    [fontFamily.bold]: Figtree_700Bold,
    [fontFamily.extrabold]: Figtree_800ExtraBold,
    [fontFamily.serifSemibold]: Fraunces_600SemiBold,
    [fontFamily.serifBold]: Fraunces_700Bold,
    [fontFamily.serifBoldItalic]: Fraunces_700Bold_Italic,
    [fontFamily.serifExtrabold]: Fraunces_800ExtraBold,
  });
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
      {/* Dev-only tools (component catalog). Unreachable in production builds. */}
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="(dev)/ui" />
      </Stack.Protected>
    </Stack>
  );
}
