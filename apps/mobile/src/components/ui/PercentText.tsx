import { formatPercent, formatPercentForSpeech } from '@guara/utils';

import { toneForSign } from '@/theme/tones';

import { EmptyValue } from './EmptyValue';
import { Text, type TextProps } from './Text';

export interface PercentTextProps extends Omit<TextProps, 'children'> {
  /** Percent number, as in `@guara/utils` (12.5 = 12,5%). `null` renders "—". */
  value: number | null | undefined;
  fractionDigits?: number;
  showSign?: boolean;
  colorBySign?: boolean;
  /** Swap colors when going up is bad (e.g. expenses). */
  invertColors?: boolean;
}

export function PercentText({
  value,
  fractionDigits = 2,
  showSign = false,
  colorBySign = false,
  invertColors = false,
  tone,
  ...props
}: PercentTextProps) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <EmptyValue {...props} />;
  }

  const options = {
    fractionDigits,
    signDisplay: showSign ? 'always' : 'auto',
    typographicMinus: true,
  } as const;
  return (
    <Text
      tone={tone ?? (colorBySign ? toneForSign(value, invertColors) : undefined)}
      tabular
      accessibilityLabel={formatPercentForSpeech(value, options)}
      {...props}
    >
      {formatPercent(value, options)}
    </Text>
  );
}
