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
    notification: colors.negative.DEFAULT,
  },
  fonts: {
    regular: { fontFamily: fontFamily.regular, fontWeight: '400' },
    medium: { fontFamily: fontFamily.medium, fontWeight: '500' },
    bold: { fontFamily: fontFamily.bold, fontWeight: '700' },
    heavy: { fontFamily: fontFamily.extrabold, fontWeight: '800' },
  },
};

/** Every screen draws its own header (`TopBar` on phones, `PageHeader` on tablets). */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background.DEFAULT },
};
