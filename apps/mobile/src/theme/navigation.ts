import { colors, fontFamily } from '@guara/ui-tokens';
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
  fonts: {
    regular: { fontFamily: fontFamily.regular, fontWeight: '400' },
    medium: { fontFamily: fontFamily.medium, fontWeight: '500' },
    bold: { fontFamily: fontFamily.semibold, fontWeight: '600' },
    heavy: { fontFamily: fontFamily.bold, fontWeight: '700' },
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
