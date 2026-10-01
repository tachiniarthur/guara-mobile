import { colors, iconSize } from '@guara/ui-tokens';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Text } from './Text';
import { hitSlopFor } from './touch';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

/** Selectable filter (categories, banks, asset types). */
export function Chip({
  label,
  selected,
  onPress,
  icon: Icon,
  disabled = false,
  className,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      hitSlop={hitSlopFor('sm')}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className={cn(
        'h-control-sm flex-row items-center gap-1.5 self-start rounded-full border px-3',
        selected
          ? 'border-brand bg-brand-muted'
          : 'border-border bg-surface active:bg-surface-pressed',
        disabled && 'opacity-50',
        className,
      )}
    >
      {Icon ? (
        <Icon
          size={iconSize.sm}
          color={selected ? colors.brand.DEFAULT : colors.foreground.muted}
        />
      ) : null}
      <Text variant="label" tone={selected ? 'brand' : 'muted'} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
