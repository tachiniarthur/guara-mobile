/**
 * Font families as registered with expo-font (Inter via @expo-google-fonts/inter).
 * On Android a custom font needs one family per weight — never rely on `fontWeight` alone.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

/** Raw [fontSize, lineHeight] scale in dp (kept for one-off cases). */
export const fontSize = {
  xs: [12, 16],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 26],
  xl: [20, 28],
  '2xl': [24, 32],
  '3xl': [30, 36],
  '4xl': [36, 42],
} as const satisfies Record<string, readonly [number, number]>;

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamilyKey;
  letterSpacing: number;
  /** Upper bound for the system font scale (accessibility "larger text"). */
  maxFontSizeMultiplier: number;
}

/** Semantic type scale. Every text in the app uses one of these variants. */
export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'semibold',
    letterSpacing: -0.5,
    maxFontSizeMultiplier: 1.3,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'semibold',
    letterSpacing: -0.25,
    maxFontSizeMultiplier: 1.4,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'semibold',
    letterSpacing: 0,
    maxFontSizeMultiplier: 1.5,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'regular',
    letterSpacing: 0,
    maxFontSizeMultiplier: 1.8,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'regular',
    letterSpacing: 0.1,
    maxFontSizeMultiplier: 1.8,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'medium',
    letterSpacing: 0.1,
    maxFontSizeMultiplier: 1.6,
  },
} as const satisfies Record<string, TypographyStyle>;

export type TypographyVariant = keyof typeof typography;
