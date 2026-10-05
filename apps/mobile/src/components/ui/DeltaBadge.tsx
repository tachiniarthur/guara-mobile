import { formatPercent, formatPercentForSpeech } from '@guara/utils';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor, toneForSign } from '@/theme/tones';

import { EmptyValue } from './EmptyValue';
import { Icon } from './Icon';
import { Text } from './Text';

export interface DeltaBadgeProps {
  /** Variation in percent (2.3 = +2,3%). `null` renders "—". */
  value: number | null | undefined;
  /** Comparison context, e.g. "vs mês anterior", "vs CDI". */
  label?: string;
  /** Use when an increase is bad (spending): up = red, down = green. */
  invertColors?: boolean;
  fractionDigits?: number;
  className?: string;
}

const TINT = {
  positive: 'bg-positive-muted',
  negative: 'bg-negative-muted',
  default: 'bg-surface-muted',
} as const;

/** Variation pill with arrow and color: "↗ +2,3% vs mês anterior". */
export function DeltaBadge({
  value,
  label,
  invertColors = false,
  fractionDigits = 1,
  className,
}: DeltaBadgeProps) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <EmptyValue variant="caption" />;
  }

  const options = { fractionDigits, signDisplay: 'always', typographicMinus: true } as const;
  const text = formatPercent(value, options);
  const isZero = text.replace(/[^1-9]/g, '') === '';
  const tone = isZero ? 'default' : toneForSign(value, invertColors);
  const icon = isZero ? null : value > 0 ? 'arrowUp' : 'arrowDown';
  const tint = tone === 'positive' || tone === 'negative' ? TINT[tone] : TINT.default;

  return (
    <View
      accessible
      accessibilityLabel={[formatPercentForSpeech(value, options), label].filter(Boolean).join(' ')}
      className={cn(
        'h-6 flex-row items-center gap-1 self-start rounded-full px-2',
        tint,
        className,
      )}
    >
      {icon ? <Icon name={icon} size={14} strokeWidth={2.2} color={toneColor[tone]} /> : null}
      <Text size={12} weight="bold" tone={tone} tabular numberOfLines={1}>
        {text}
      </Text>
      {label ? (
        <Text size={12} tone="muted" numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
