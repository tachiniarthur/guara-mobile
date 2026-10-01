import { colors, iconSize } from '@guara/ui-tokens';
import { CheckIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Text } from './Text';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Simple multiple-selection checkbox with label. */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => {
        haptics.selection();
        onChange(!checked);
      }}
      className={cn(
        'min-h-touch flex-row items-center gap-3 py-2',
        disabled && 'opacity-50',
        className,
      )}
    >
      <View
        className={cn(
          'h-5 w-5 items-center justify-center rounded-sm border-2',
          checked ? 'border-brand-solid bg-brand-solid' : 'border-border-strong',
        )}
      >
        {checked ? (
          <CheckIcon size={iconSize.sm} color={colors.brand.foreground} strokeWidth={3} />
        ) : null}
      </View>
      <View className="flex-1 gap-0.5">
        <Text variant="body">{label}</Text>
        {description ? (
          <Text variant="caption" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
