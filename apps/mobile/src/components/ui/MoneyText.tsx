import type { Cents, Currency } from '@guara/types';
import { formatCents, formatCentsCompact, formatCentsForSpeech } from '@guara/utils';

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
  /** Privacy mode: hide the amount ("R$ ••••"). */
  masked?: boolean;
}

/** Formatted money from integer cents, with tabular digits and a spoken label. */
export function MoneyText({
  value,
  currency = 'BRL',
  showSign = false,
  colorBySign = false,
  compact = false,
  masked = false,
  tone,
  ...props
}: MoneyTextProps) {
  if (value === null || value === undefined) return <EmptyValue {...props} />;

  if (masked) {
    return (
      <Text tone={tone} tabular accessibilityLabel="valor oculto" {...props}>
        R$ ••••
      </Text>
    );
  }

  const signDisplay = showSign ? 'always' : 'auto';
  const text = compact
    ? formatCentsCompact(value, { currency, signDisplay })
    : formatCents(value, { currency, signDisplay });
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
