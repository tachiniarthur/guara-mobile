import { iconSize } from '@guara/ui-tokens';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tones';

import { Text } from './Text';

export type BadgeTone = 'neutral' | 'positive' | 'negative' | 'warning' | 'info' | 'brand';

const badgeVariants = cva('flex-row items-center gap-1 self-start rounded-full px-2 py-0.5', {
  variants: {
    tone: {
      neutral: 'bg-surface-muted',
      positive: 'bg-positive-muted',
      negative: 'bg-negative-muted',
      warning: 'bg-warning-muted',
      info: 'bg-info-muted',
      brand: 'bg-brand-muted',
    } satisfies Record<BadgeTone, string>,
  },
});

const TEXT_TONE = {
  neutral: 'muted',
  positive: 'positive',
  negative: 'negative',
  warning: 'warning',
  info: 'info',
  brand: 'brand',
} as const satisfies Record<BadgeTone, string>;

export interface BadgeProps {
  label: string;
  /**
   * Suggested mapping: connected/buy/low risk → positive; expiring/medium risk → warning;
   * expired/sell/high risk → negative; Open Finance → info; manual → neutral.
   */
  tone?: BadgeTone;
  icon?: LucideIcon;
  className?: string;
}

/** Short status label (consent status, origin, buy/sell, risk). */
export function Badge({ label, tone = 'neutral', icon: Icon, className }: BadgeProps) {
  const textTone = TEXT_TONE[tone];
  return (
    <View accessible accessibilityLabel={label} className={cn(badgeVariants({ tone }), className)}>
      {Icon ? <Icon size={iconSize.sm} color={toneColor[textTone]} /> : null}
      <Text variant="caption" weight="medium" tone={textTone} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
