/**
 * Font families as registered with expo-font (@expo-google-fonts/figtree and /fraunces).
 * Fraunces (warm serif) for numbers and titles; Figtree (humanist sans) to read and tap.
 * On Android a custom font needs one family per weight — never rely on `fontWeight` alone.
 */
export const fontFamily = {
  regular: 'Figtree_400Regular',
  italic: 'Figtree_400Regular_Italic',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
  serifSemibold: 'Fraunces_600SemiBold',
  serifBold: 'Fraunces_700Bold',
  serifBoldItalic: 'Fraunces_700Bold_Italic',
  serifExtrabold: 'Fraunces_800ExtraBold',
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

export type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

/** Family for a weight of each typeface (Fraunces only ships 600–800 here). */
export function fontFor(
  weight: FontWeightName,
  { serif = false, italic = false }: { serif?: boolean; italic?: boolean } = {},
): string {
  if (serif) {
    if (italic) return fontFamily.serifBoldItalic;
    if (weight === 'extrabold') return fontFamily.serifExtrabold;
    if (weight === 'bold') return fontFamily.serifBold;
    return fontFamily.serifSemibold;
  }
  if (italic) return fontFamily.italic;
  return fontFamily[weight];
}

export interface TypographyStyle {
  fontSize: number;
  /** Line height as a ratio of the font size (CSS unitless line-height). */
  leading: number;
  weight: FontWeightName;
  serif: boolean;
  /** Letter spacing in em. */
  tracking: number;
  /** Upper bound for the system font scale (accessibility "larger text"). */
  maxFontSizeMultiplier: number;
}

/**
 * Semantic type scale (Fundamentos do design). Every text uses one of these variants; size,
 * weight and leading can be overridden per use.
 */
export const typography = {
  /** Fraunces 800 — balances and hero numbers. */
  hero: {
    fontSize: 38,
    leading: 1,
    weight: 'extrabold',
    serif: true,
    tracking: -0.02,
    maxFontSizeMultiplier: 1.2,
  },
  /** Fraunces 800 — page title ("Boa tarde, Arthur."). */
  display: {
    fontSize: 30,
    leading: 1.1,
    weight: 'extrabold',
    serif: true,
    tracking: -0.02,
    maxFontSizeMultiplier: 1.3,
  },
  /** Fraunces 800 — onboarding and form titles. */
  title: {
    fontSize: 26,
    leading: 1.2,
    weight: 'extrabold',
    serif: true,
    tracking: -0.01,
    maxFontSizeMultiplier: 1.3,
  },
  /** Fraunces 800 — section title ("Resumo de setembro"). */
  section: {
    fontSize: 22,
    leading: 1.2,
    weight: 'extrabold',
    serif: true,
    tracking: -0.01,
    maxFontSizeMultiplier: 1.4,
  },
  /** Fraunces 700 — card title ("Precisa de você"). */
  heading: {
    fontSize: 19,
    leading: 1.2,
    weight: 'bold',
    serif: true,
    tracking: -0.01,
    maxFontSizeMultiplier: 1.4,
  },
  /** Figtree 600 — list item title. */
  subtitle: {
    fontSize: 15,
    leading: 1.3,
    weight: 'semibold',
    serif: false,
    tracking: 0,
    maxFontSizeMultiplier: 1.5,
  },
  /** Figtree 400 — text. */
  body: {
    fontSize: 15,
    leading: 1.5,
    weight: 'regular',
    serif: false,
    tracking: 0,
    maxFontSizeMultiplier: 1.8,
  },
  /** Figtree 400 — intro paragraphs and chat (minimum 16 on mobile). */
  lead: {
    fontSize: 16,
    leading: 1.6,
    weight: 'regular',
    serif: false,
    tracking: 0,
    maxFontSizeMultiplier: 1.8,
  },
  /** Figtree 700 — buttons and field labels. */
  label: {
    fontSize: 14,
    leading: 1.4,
    weight: 'bold',
    serif: false,
    tracking: 0,
    maxFontSizeMultiplier: 1.6,
  },
  /** Figtree 400 — supporting text. */
  caption: {
    fontSize: 13,
    leading: 1.5,
    weight: 'regular',
    serif: false,
    tracking: 0,
    maxFontSizeMultiplier: 1.8,
  },
  /** Figtree 400 — metadata (never below 12). */
  micro: {
    fontSize: 12,
    leading: 1.4,
    weight: 'regular',
    serif: false,
    tracking: 0,
    maxFontSizeMultiplier: 1.8,
  },
} as const satisfies Record<string, TypographyStyle>;

export type TypographyVariant = keyof typeof typography;
