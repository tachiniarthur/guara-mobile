import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Icon } from './Icon';
import { Text } from './Text';

export interface CheckboxBoxProps {
  checked: boolean;
  /** Fill color when checked: Areia (default) or Tucano. */
  tone?: 'default' | 'brand';
}

/** The 22×22 box alone (Areia when checked), for tables of options. */
export function CheckboxBox({ checked, tone = 'default' }: CheckboxBoxProps) {
  return (
    <View
      className={cn(
        'h-[22px] w-[22px] items-center justify-center rounded-4 border-2',
        checked
          ? tone === 'brand'
            ? 'border-brand bg-brand'
            : 'border-foreground bg-foreground'
          : 'border-foreground-subtle bg-transparent',
      )}
    >
      {checked ? (
        <Icon name="check" size={16} color={colors.foreground.inverse} strokeWidth={3} />
      ) : null}
    </View>
  );
}

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Visible label. Pass `accessibilityLabel` instead for a bare box. */
  label?: string;
  description?: string;
  /** `switch` announces an on/off setting ("Reduzir animações"). */
  role?: 'checkbox' | 'switch';
  disabled?: boolean;
  accessibilityLabel?: string;
  /** Extra content on the right (e.g. a counter). */
  trailing?: ReactNode;
  tone?: 'default' | 'brand';
  /** Label weight (design: 500, or 700 in some forms). */
  labelWeight?: 'medium' | 'bold';
  className?: string;
}

/** Checkbox row of the design: 22 box + label and optional description, 52 tall. */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  role = 'checkbox',
  disabled = false,
  accessibilityLabel,
  trailing,
  tone = 'default',
  labelWeight = 'medium',
  className,
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={description}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={label ? undefined : 11}
      onPress={() => {
        haptics.selection();
        onChange(!checked);
      }}
      className={cn(
        'flex-row items-center gap-3',
        label ? 'min-h-13' : 'self-start',
        disabled && 'opacity-50',
        className,
      )}
    >
      <CheckboxBox checked={checked} tone={tone} />
      {label ? (
        <View className="flex-1">
          <Text weight={labelWeight} leading={1.35}>
            {label}
          </Text>
          {description ? (
            <Text variant="caption" tone="subtle" leading={1.35}>
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
      {trailing}
    </Pressable>
  );
}
