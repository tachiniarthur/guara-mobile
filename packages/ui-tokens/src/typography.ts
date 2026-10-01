/** Font family names as registered with expo-font (system font until custom fonts are added). */
export const fontFamily = {
  sans: 'System',
  mono: 'monospace',
} as const;

/** [fontSize, lineHeight] in dp. */
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

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontSizeKey = keyof typeof fontSize;
