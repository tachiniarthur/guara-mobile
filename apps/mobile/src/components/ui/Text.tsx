import { fontFor, typography, type FontWeightName, type TypographyVariant } from '@guara/ui-tokens';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';
import { TEXT_SCALE, useUiPreferences } from '@/stores/ui-preferences';

import { SKELETON_TEXT, useSkeleton } from './SkeletonScope';

/** Tone classes (Tailwind only compiles classes written in full). */
export const textVariants = cva('', {
  variants: {
    tone: {
      default: 'text-foreground',
      soft: 'text-foreground-soft',
      muted: 'text-foreground-muted',
      subtle: 'text-foreground-subtle',
      positive: 'text-positive',
      negative: 'text-negative',
      warning: 'text-warning',
      info: 'text-info',
      brand: 'text-brand',
      inverse: 'text-foreground-inverse',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: { tone: 'default' },
});

export type TextTone = NonNullable<VariantProps<typeof textVariants>['tone']>;

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {
  /** Semantic style from the type scale (default `body`). */
  variant?: TypographyVariant;
  /** Font size override in dp. */
  size?: number;
  weight?: FontWeightName;
  /** Fraunces instead of Figtree. */
  serif?: boolean;
  italic?: boolean;
  /** Line height as a ratio of the size (CSS unitless line-height). */
  leading?: number;
  /** Letter spacing in em. */
  tracking?: number;
  /** Tabular (fixed-width) digits so numbers line up. */
  tabular?: boolean;
  /** Underlined link style (`text-underline-offset` is not supported by React Native). */
  underline?: boolean;
  className?: string;
}

/**
 * The only text primitive of the app: type scale (Fraunces/Figtree) + semantic tone.
 * Caps system font scaling per variant (`maxFontSizeMultiplier` from the tokens).
 */
export function Text({
  variant = 'body',
  size,
  weight,
  serif,
  italic = false,
  leading,
  tracking,
  tone,
  align,
  tabular = false,
  underline = false,
  className,
  style,
  maxFontSizeMultiplier,
  children,
  ...props
}: TextProps) {
  const skeleton = useSkeleton();
  const base = typography[variant];
  const scale = useUiPreferences((state) => TEXT_SCALE[state.textSize]);
  const fontSize = (size ?? base.fontSize) * scale;
  const isSerif = serif ?? base.serif;
  const letterSpacing = (tracking ?? base.tracking) * fontSize;

  return (
    <RNText
      className={cn(textVariants({ tone, align }), className)}
      style={[
        {
          fontFamily: fontFor(weight ?? base.weight, { serif: isSerif, italic }),
          fontSize,
          lineHeight: Math.round(fontSize * (leading ?? base.leading)),
          letterSpacing: letterSpacing === 0 ? undefined : letterSpacing,
        },
        tabular && { fontVariant: ['tabular-nums'] },
        underline && { textDecorationLine: 'underline' },
        style,
        skeleton && { color: SKELETON_TEXT.color, textDecorationLine: 'none' },
      ]}
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? base.maxFontSizeMultiplier}
      {...props}
    >
      {/* Loading: the nested run paints a block only behind the glyphs, like the design. */}
      {skeleton ? <RNText style={SKELETON_TEXT}>{children}</RNText> : children}
    </RNText>
  );
}

export interface SpanProps extends RNTextProps, VariantProps<typeof textVariants> {
  weight?: FontWeightName;
  serif?: boolean;
  italic?: boolean;
  tabular?: boolean;
  underline?: boolean;
  className?: string;
}

/**
 * Inline run inside a `Text` (`<strong>`, a colored number in a sentence). Inherits size and
 * line height from the parent and only changes weight, family and tone.
 */
export function Span({
  weight,
  serif = false,
  italic = false,
  tone,
  tabular = false,
  underline = false,
  className,
  style,
  ...props
}: SpanProps) {
  const skeleton = useSkeleton();
  return (
    <RNText
      className={cn(tone ? textVariants({ tone }) : undefined, className)}
      style={[
        (weight || italic || serif) && {
          fontFamily: fontFor(weight ?? 'regular', { serif, italic }),
        },
        tabular && { fontVariant: ['tabular-nums'] },
        underline && { textDecorationLine: 'underline' },
        style,
        skeleton && { color: SKELETON_TEXT.color, textDecorationLine: 'none' },
      ]}
      {...props}
    />
  );
}
