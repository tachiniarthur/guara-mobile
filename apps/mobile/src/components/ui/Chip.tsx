import { colors } from '@guara/ui-tokens';
import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { hitSlopFor } from './touch';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** Height in dp: 32, 34, 36 (default), 40 or 44. */
  size?: 32 | 34 | 36 | 40 | 44;
  /** Unselected look: `outline` (transparent) or `filled` (Folha escura). */
  appearance?: 'outline' | 'filled';
  /** Stretch inside grids ("Tipo de investimento"). */
  fill?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
}

const HEIGHT_CLASS = {
  32: 'h-8 px-3',
  34: 'h-[34px] px-3',
  36: 'h-9 px-3.5',
  40: 'h-10 px-3.5',
  44: 'h-11 px-3.5',
};

/** Selectable pill (filters, periods, simulation types). Selected = Areia with dark text. */
export function Chip({
  label,
  selected,
  onPress,
  icon,
  size = 36,
  appearance = 'outline',
  fill = false,
  disabled = false,
  accessibilityLabel,
  className,
}: ChipProps) {
  const textColor = selected ? colors.foreground.inverse : colors.foreground.muted;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      hitSlop={hitSlopFor(size)}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className={cn(
        'flex-row items-center gap-1.5 rounded-full border',
        HEIGHT_CLASS[size],
        fill ? 'justify-center' : 'self-start',
        selected
          ? 'border-foreground bg-foreground'
          : cn(
              'border-border-strong active:bg-surface-pressed',
              appearance === 'filled' ? 'bg-surface' : 'bg-transparent',
            ),
        disabled && 'opacity-50',
        className,
      )}
    >
      {icon ? <Icon name={icon} size={16} color={textColor} /> : null}
      <Text
        size={size >= 40 ? 14 : 13}
        weight={size >= 40 ? (selected ? 'bold' : 'medium') : 'bold'}
        style={{ color: textColor }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
