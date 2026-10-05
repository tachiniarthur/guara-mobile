import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  /** Custom leading element (e.g. `<Avatar />`). */
  leading?: ReactNode;
  /** Shortcut for an icon in a rounded tile. Ignored when `leading` is set. */
  leadingIcon?: IconName;
  /** Right side content, e.g. `<MoneyText />` or `<Badge />`. */
  trailing?: ReactNode;
  /** Secondary text under the trailing content (e.g. a date). */
  trailingCaption?: string;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
}

/** Row used by transactions, positions, subscriptions and menus. */
export function ListItem({
  title,
  subtitle,
  leading,
  leadingIcon,
  trailing,
  trailingCaption,
  showChevron = false,
  onPress,
  disabled = false,
  accessibilityLabel,
  className,
}: ListItemProps) {
  const content = (
    <>
      {leading ??
        (leadingIcon ? (
          <View className="h-10 w-10 items-center justify-center rounded-12 bg-surface-muted">
            <Icon name={leadingIcon} size={20} color={colors.foreground.muted} />
          </View>
        ) : null)}
      <View className="flex-1 gap-0.5">
        <Text variant="subtitle" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing || trailingCaption ? (
        <View className="items-end gap-0.5">
          {trailing}
          {trailingCaption ? (
            <Text variant="caption" tone="subtle">
              {trailingCaption}
            </Text>
          ) : null}
        </View>
      ) : null}
      {showChevron ? <Icon name="chevronRight" size={18} color={colors.foreground.subtle} /> : null}
    </>
  );

  const classes = cn('min-h-12 flex-row items-center gap-3 py-2.5', className);

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        className={cn(classes, 'active:bg-surface-pressed', disabled && 'opacity-50')}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View accessible accessibilityLabel={accessibilityLabel} className={classes}>
      {content}
    </View>
  );
}
