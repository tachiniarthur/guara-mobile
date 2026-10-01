import { colors } from '@guara/ui-tokens';
import { DarkTheme, type NativeStackNavigationOptions, type Theme } from 'expo-router';

/** React Navigation theme built from the design tokens (dark only). */
export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.brand.DEFAULT,
    background: colors.background.DEFAULT,
    card: colors.background.elevated,
    text: colors.foreground.DEFAULT,
    border: colors.border.DEFAULT,
    notification: colors.brand.DEFAULT,
  },
};

/** Shared header style. Placeholder screens render their own title in the body. */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background.DEFAULT },
  headerTintColor: colors.foreground.DEFAULT,
  headerShadowVisible: false,
  headerTitle: '',
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.background.DEFAULT },
};

export const tabBarColors = {
  background: colors.background.elevated,
  border: colors.border.DEFAULT,
  active: colors.brand.DEFAULT,
  inactive: colors.foreground.subtle,
} as const;
