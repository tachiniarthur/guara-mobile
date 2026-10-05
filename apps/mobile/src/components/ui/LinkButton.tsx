import { colors } from '@guara/ui-tokens';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './Icon';
import { Text } from './Text';

export interface LinkButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  /** Trailing chevron (default true). */
  chevron?: boolean;
  tone?: 'default' | 'negative' | 'muted';
  size?: number;
  className?: string;
}

const TONE_COLOR = {
  default: colors.foreground.DEFAULT,
  negative: colors.negative.DEFAULT,
  muted: colors.foreground.muted,
};

/** Underlined text action with a chevron ("Ver assistentes ›", "Relatório completo ›"). */
export function LinkButton({
  label,
  chevron = true,
  tone = 'default',
  size = 14,
  className,
  ...props
}: LinkButtonProps) {
  const color = TONE_COLOR[tone];
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      className={cn('min-h-8 flex-row items-center gap-1 active:opacity-70', className)}
      {...props}
    >
      <Text size={size} weight="bold" underline numberOfLines={1} style={{ color }}>
        {label}
      </Text>
      {chevron ? <Icon name="chevronRight" size={16} color={color} /> : null}
    </Pressable>
  );
}
