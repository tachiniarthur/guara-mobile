import { colors } from '@guara/ui-tokens';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface SelectPillProps extends Omit<PressableProps, 'children'> {
  label: string;
  /** Leading icon (calendar on tablets). */
  icon?: IconName;
  /** Height in dp (design: 44 or 48). */
  size?: 44 | 48;
  className?: string;
}

/** Outlined pill that opens a picker ("Set 2026 ⌄"). */
export function SelectPill({ label, icon, size = 48, className, ...props }: SelectPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: false }}
      className={cn(
        'flex-row items-center gap-2 rounded-full border border-border-strong bg-surface active:bg-surface-pressed',
        size === 48 ? 'h-12 px-3.5' : 'h-11 px-3.5',
        className,
      )}
      {...props}
    >
      {icon ? <Icon name={icon} size={18} color={colors.foreground.muted} /> : null}
      <Text
        size={size === 48 ? 15 : 14}
        weight={size === 48 ? 'semibold' : 'medium'}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Icon name="chevronDown" size={16} color={colors.foreground.muted} />
    </Pressable>
  );
}
