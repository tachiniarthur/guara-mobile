import { typography, type TypographyVariant } from '@guara/ui-tokens';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

/** Class literals (Tailwind only compiles classes written in full). */
export const textVariants = cva('', {
  variants: {
    variant: {
      display: 'font-sans-semibold text-display',
      title: 'font-sans-semibold text-title',
      subtitle: 'font-sans-semibold text-subtitle',
      body: 'font-sans text-body',
      caption: 'font-sans text-caption',
      label: 'font-sans-medium text-label',
    } satisfies Record<TypographyVariant, string>,
    tone: {
      default: 'text-foreground',
      muted: 'text-foreground-muted',
      subtle: 'text-foreground-subtle',
      positive: 'text-positive',
      negative: 'text-negative',
      warning: 'text-warning',
      info: 'text-info',
      brand: 'text-brand',
      inverse: 'text-foreground-inverse',
    },
    weight: {
      regular: 'font-sans',
      medium: 'font-sans-medium',
      semibold: 'font-sans-semibold',
      bold: 'font-sans-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: { variant: 'body', tone: 'default' },
});

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {
  className?: string;
  /** Tabular (fixed-width) digits so columns of numbers line up. */
  tabular?: boolean;
}

/**
 * The only text primitive of the app: typography scale + semantic tone.
 * Caps system font scaling per variant (`maxFontSizeMultiplier` from the tokens).
 */
export function Text({
  variant,
  tone,
  weight,
  align,
  tabular = false,
  className,
  style,
  maxFontSizeMultiplier,
  ...props
}: TextProps) {
  return (
    <RNText
      className={cn(textVariants({ variant, tone, weight, align }), className)}
      style={[tabular && { fontVariant: ['tabular-nums'] }, style]}
      maxFontSizeMultiplier={
        maxFontSizeMultiplier ?? typography[variant ?? 'body'].maxFontSizeMultiplier
      }
      {...props}
    />
  );
}
