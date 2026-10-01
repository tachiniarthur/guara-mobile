import { iconSize } from '@guara/ui-tokens';
import { formatPercent, formatPercentForSpeech } from '@guara/utils';
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor, toneForSign } from '@/theme/tones';

import { EmptyValue } from './EmptyValue';
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

  const options = { fractionDigits, signDisplay: 'always' } as const;
  const text = formatPercent(value, options);
  const isZero = text.replace(/[^1-9]/g, '') === '';
  const tone = isZero ? 'default' : toneForSign(value, invertColors);
  const Icon = isZero ? MinusIcon : value > 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  const tint = tone === 'positive' || tone === 'negative' ? TINT[tone] : TINT.default;

  return (
    <View
      accessible
      accessibilityLabel={[formatPercentForSpeech(value, options), label].filter(Boolean).join(' ')}
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full px-2 py-0.5',
        tint,
        className,
      )}
    >
      <Icon size={iconSize.sm} color={toneColor[tone]} />
      <Text variant="caption" weight="medium" tone={tone} tabular numberOfLines={1}>
        {text}
      </Text>
      {label ? (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
