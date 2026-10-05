import { colors } from '@guara/ui-tokens';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface SelectPillProps extends Omit<PressableProps, 'children'> {
  label: string;
  /** Leading icon (calendar on tablets). */
  icon?: IconName;
  /** Height in dp (design: 44 or 48; 36 = transparent filter pill of the lists). */
  size?: 36 | 44 | 48;
  className?: string;
}

/** Outlined pill that opens a picker ("Set 2026 ⌄"). */
export function SelectPill({ label, icon, size = 48, className, ...props }: SelectPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: false }}
      hitSlop={size === 36 ? 4 : undefined}
      className={cn(
        'flex-row items-center rounded-full border border-border-strong active:bg-surface-pressed',
        size === 48 && 'h-12 gap-2 bg-surface px-3.5',
        size === 44 && 'h-11 gap-2 bg-surface px-3.5',
        size === 36 && 'h-9 gap-1.5 bg-transparent px-3',
        className,
      )}
      {...props}
    >
      {icon ? (
        <Icon name={icon} size={size === 36 ? 16 : 18} color={colors.foreground.muted} />
      ) : null}
      <Text
        size={size === 48 ? 15 : 14}
        weight={size === 44 ? 'medium' : 'semibold'}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Icon name="chevronDown" size={size === 36 ? 14 : 16} color={colors.foreground.muted} />
    </Pressable>
  );
}
