import type { Cents, Currency } from '@guara/types';
import { formatCents, formatCentsCompact, formatCentsForSpeech } from '@guara/utils';

import { useUiPreferences } from '@/stores/ui-preferences';
import { toneForSign } from '@/theme/tones';

import { EmptyValue } from './EmptyValue';
import { Text, type TextProps } from './Text';

export interface MoneyTextProps extends Omit<TextProps, 'children'> {
  /** Integer cents. `null`/`undefined` renders "—". */
  value: Cents | null | undefined;
  currency?: Currency;
  /** Show "+" on positive amounts ("−" is always shown). */
  showSign?: boolean;
  /** Green for positive, red for negative. */
  colorBySign?: boolean;
  /** Short format: "R$ 1,2 mil". The accessibility label keeps full precision. */
  compact?: boolean;
  /** Privacy mode: hide the amount ("R$ •••"). Default: "Ocultar valores" of the app. */
  masked?: boolean;
  /** Drop the cents ("R$ 742"). */
  wholeUnits?: boolean;
}

/** An amount while "Ocultar valores" is on. */
export const HIDDEN_MONEY = 'R$ •••';

/** "Faltam R$ 63,60 até o limite" → "Faltam R$ ••• até o limite" (the sign stays). */
export function maskMoneyIn(text: string): string {
  return text.replace(/R\$\s?\d[\d.]*(,\d+)?(\s?mil)?/g, HIDDEN_MONEY);
}

/**
 * `formatCents` that follows "Ocultar valores": for amounts written inside sentences ("Faltam
 * R$ ••• até o limite"). Standalone amounts use `MoneyText`.
 */
export function useMoneyFormat() {
  const hidden = useUiPreferences((state) => state.hideBalances);
  return {
    hidden,
    money: (value: Cents | number, options?: Parameters<typeof formatCents>[1]) =>
      hidden ? HIDDEN_MONEY : formatCents(value, options),
    /** Hides every amount inside a ready sentence ("Compra de R$ ••• às 02:14"). */
    mask: (text: string) => (hidden ? maskMoneyIn(text) : text),
  };
}

/** Formatted money from integer cents, with tabular digits and a spoken label. */
export function MoneyText({
  value,
  currency = 'BRL',
  showSign = false,
  colorBySign = false,
  compact = false,
  masked,
  wholeUnits = false,
  tone,
  ...props
}: MoneyTextProps) {
  const hidden = useUiPreferences((state) => state.hideBalances);
  if (value === null || value === undefined) return <EmptyValue {...props} />;

  if (masked ?? hidden) {
    return (
      <Text tone={tone} tabular accessibilityLabel="valor oculto" {...props}>
        {HIDDEN_MONEY}
      </Text>
    );
  }

  const signDisplay = showSign ? 'always' : 'auto';
  // The UI always uses the typographic minus ("−R$ 18,40").
  const text = compact
    ? formatCentsCompact(value, { currency, signDisplay, typographicMinus: true })
    : formatCents(value, { currency, signDisplay, wholeUnits, typographicMinus: true });
  const spoken = `${showSign && value > 0 ? 'mais ' : ''}${formatCentsForSpeech(value, currency)}`;

  return (
    <Text
      tone={tone ?? (colorBySign ? toneForSign(value) : undefined)}
      tabular
      accessibilityLabel={spoken}
      {...props}
    >
      {text}
    </Text>
  );
}
