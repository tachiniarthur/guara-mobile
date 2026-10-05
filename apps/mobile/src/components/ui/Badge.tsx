import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tones';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'positive' | 'negative' | 'warning' | 'info' | 'brand';

/**
 * - `soft` (default): tinted pill, 24 tall, 12 bold with tracking ("Fora do padrão", "Comprar").
 * - `status`: 26 tall, 13 bold, with a leading dot ("● Tranquilo", "● Atenção").
 * - `solid`: filled with the tone color and dark text ("1 alerta").
 * - `scrim`: dark translucent pill over photos ("analisando gastos", "Cerrado").
 */
export type BadgeAppearance = 'soft' | 'status' | 'solid' | 'scrim';

const SOFT_BG: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted',
  positive: 'bg-positive-muted',
  negative: 'bg-negative-muted',
  warning: 'bg-warning-muted',
  info: 'bg-info-muted',
  brand: 'bg-brand-muted',
};

const SOLID_BG: Record<BadgeTone, string> = {
  neutral: 'bg-foreground',
  positive: 'bg-positive',
  negative: 'bg-negative',
  warning: 'bg-warning',
  info: 'bg-info',
  brand: 'bg-brand',
};

const DOT_BG: Record<BadgeTone, string> = {
  neutral: 'bg-foreground-muted',
  positive: 'bg-positive',
  negative: 'bg-negative',
  warning: 'bg-warning',
  info: 'bg-info',
  brand: 'bg-brand',
};

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
  tone?: BadgeTone;
  appearance?: BadgeAppearance;
  icon?: IconName;
  className?: string;
}

/** Short status label (out of pattern, buy/sell, month state, assistant activity). */
export function Badge({
  label,
  tone = 'neutral',
  appearance = 'soft',
  icon,
  className,
}: BadgeProps) {
  const isScrim = appearance === 'scrim';
  const isSolid = appearance === 'solid';
  const isStatus = appearance === 'status';
  const textTone = isSolid ? 'inverse' : isScrim ? undefined : TEXT_TONE[tone];

  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn(
        'flex-row items-center self-start rounded-full',
        isScrim && 'h-7 gap-1.5 bg-scrim-strong px-3',
        isSolid && cn('h-7 gap-1.5 px-3', SOLID_BG[tone]),
        isStatus && cn('h-6.5 gap-1.5 px-2.5', SOFT_BG[tone]),
        appearance === 'soft' &&
          cn('h-6 gap-1 px-2', SOFT_BG[tone], tone === 'neutral' && 'px-2.5'),
        className,
      )}
    >
      {isStatus ? <View className={cn('h-[7px] w-[7px] rounded-full', DOT_BG[tone])} /> : null}
      {icon ? (
        <Icon
          name={icon}
          size={14}
          strokeWidth={2.2}
          color={
            isSolid
              ? colors.foreground.inverse
              : isScrim
                ? colors.scrim.foreground
                : toneColor[TEXT_TONE[tone]]
          }
        />
      ) : null}
      <Text
        size={isStatus ? 13 : 12}
        weight="bold"
        tracking={appearance === 'soft' && tone !== 'neutral' ? 0.04 : 0}
        tone={textTone}
        className={isScrim ? 'text-scrim-foreground' : undefined}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
