import { ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';

import { navigationTheme } from '@/theme/navigation';

/** Dark theme only (userInterfaceStyle: "dark"). NativeWind classes read the same tokens. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      {children}
    </NavigationThemeProvider>
  );
}
