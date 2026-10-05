import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon } from './Icon';
import { OptionSheet } from './OptionSheet';
import { Text } from './Text';

export interface SelectFieldProps<V extends string> {
  label: string;
  options: readonly { value: V; label: string; description?: string }[];
  value: V;
  onChange: (value: V) => void;
  /** Text size of the value (design: 16 or 17). */
  textSize?: number;
  className?: string;
}

/** Pill select (52 tall) that opens a bottom sheet with the options. */
export function SelectField<V extends string>({
  label,
  options,
  value,
  onChange,
  textSize = 16,
  className,
}: SelectFieldProps<V>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <View className={cn('gap-2', className)}>
      <Text variant="label">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? ''}`}
        accessibilityHint="Abre a lista de opções"
        onPress={() => setOpen(true)}
        className="h-control-lg flex-row items-center gap-2 rounded-full border border-border-strong bg-surface-input px-3.5 active:bg-surface-pressed"
      >
        <Text size={textSize} className="flex-1" numberOfLines={1}>
          {selected?.label}
        </Text>
        <Icon name="chevronDown" size={18} color={colors.foreground.muted} />
      </Pressable>
      <OptionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        options={options}
        value={value}
        onChange={onChange}
      />
    </View>
  );
}
