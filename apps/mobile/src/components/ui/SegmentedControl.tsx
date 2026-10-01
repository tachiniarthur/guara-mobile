import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Text } from './Text';

export interface SegmentOption<V extends string> {
  value: V;
  label: string;
  /** Spoken label when the visible one is an abbreviation ("6M" → "6 meses"). */
  accessibilityLabel?: string;
}

export interface SegmentedControlProps<V extends string> {
  options: readonly SegmentOption<V>[];
  value: V;
  onChange: (value: V) => void;
  accessibilityLabel?: string;
  className?: string;
}

/** Switch between a few short options (6M / 12M / Tudo, Lista / Por classe). */
export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  className,
}: SegmentedControlProps<V>) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'h-control-md flex-row self-stretch rounded-lg bg-surface-muted p-1',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            className={cn(
              'flex-1 items-center justify-center rounded-md',
              selected ? 'bg-surface-pressed' : 'active:bg-surface',
            )}
          >
            <Text variant="label" tone={selected ? 'default' : 'muted'} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
