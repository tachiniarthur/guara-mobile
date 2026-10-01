import type { Cents, Currency } from '@guara/types';
import { cents, formatCents, formatCentsForSpeech } from '@guara/utils';

import { Input, type InputProps } from './Input';

/** 13 digits = R$ 99.999.999.999,99 — far below Number.MAX_SAFE_INTEGER. */
const DEFAULT_MAX_DIGITS = 13;

/**
 * Converts whatever the field contains into integer cents using only digit strings
 * (no floats): "R$ 12,345" → 12345. Empty → null.
 */
export function digitsToCents(
  text: string,
  maxDigits = DEFAULT_MAX_DIGITS,
): Cents | null | 'overflow' {
  const digits = text.replace(/\D/g, '').replace(/^0+/, '');
  if (digits === '') return null;
  if (digits.length > maxDigits) return 'overflow';
  return cents(Number.parseInt(digits, 10));
}

export interface MoneyInputProps extends Omit<
  InputProps,
  'value' | 'onChangeText' | 'keyboardType' | 'defaultValue'
> {
  /** Integer cents, or `null` when empty. */
  value: Cents | null;
  onChangeValue: (value: Cents | null) => void;
  currency?: Currency;
  maxDigits?: number;
}

/**
 * Bank-app style amount field: digits fill from the right ("5" → R$ 0,05, "50" → R$ 0,50).
 * Deleting every digit returns `null`.
 */
export function MoneyInput({
  value,
  onChangeValue,
  currency = 'BRL',
  maxDigits = DEFAULT_MAX_DIGITS,
  placeholder,
  ...props
}: MoneyInputProps) {
  const display = value === null ? '' : formatCents(value, { currency });

  return (
    <Input
      value={display}
      placeholder={placeholder ?? formatCents(cents(0), { currency })}
      keyboardType="number-pad"
      inputMode="numeric"
      contextMenuHidden
      // Keep the caret at the end: digits always enter from the right.
      selection={{ start: display.length, end: display.length }}
      accessibilityValue={{ text: formatCentsForSpeech(value, currency) }}
      style={{ fontVariant: ['tabular-nums'] }}
      onChangeText={(text) => {
        const next = digitsToCents(text, maxDigits);
        if (next !== 'overflow') onChangeValue(next);
      }}
      {...props}
    />
  );
}
