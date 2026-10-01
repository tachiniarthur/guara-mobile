import { colors } from '@guara/ui-tokens';
import { Pressable, Switch as RNSwitch, View } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Text } from './Text';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Labelled toggle row (e.g. notification channels). The whole row is tappable. */
export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) {
  const toggle = (next: boolean) => {
    if (disabled) return;
    haptics.selection();
    onValueChange(next);
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => toggle(!value)}
      className={cn('min-h-touch flex-row items-center gap-3 py-2', className)}
    >
      <View className="flex-1 gap-0.5">
        <Text variant="body" tone={disabled ? 'subtle' : 'default'}>
          {label}
        </Text>
        {description ? (
          <Text variant="caption" tone="subtle">
            {description}
          </Text>
        ) : null}
      </View>
      <RNSwitch
        value={value}
        onValueChange={toggle}
        disabled={disabled}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        trackColor={{ false: colors.border.strong, true: colors.brand.solid }}
        thumbColor={colors.foreground.DEFAULT}
        ios_backgroundColor={colors.border.strong}
      />
    </Pressable>
  );
}
