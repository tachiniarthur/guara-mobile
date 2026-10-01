import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Text } from './Text';

export interface RadioOption<V extends string> {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string> {
  options: readonly RadioOption<V>[];
  /** Selected value, or `null` when nothing was chosen yet. */
  value: V | null;
  onChange: (value: V) => void;
  /** Group label for screen readers (e.g. the question). */
  accessibilityLabel: string;
  className?: string;
}

/** Single choice from a list of cards (e.g. investor-profile questions). */
export function RadioGroup<V extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  className,
}: RadioGroupProps<V>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className={cn('gap-2', className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityHint={option.description}
            accessibilityState={{ checked, disabled: option.disabled }}
            disabled={option.disabled}
            onPress={() => {
              if (checked) return;
              haptics.selection();
              onChange(option.value);
            }}
            className={cn(
              'min-h-touch flex-row items-center gap-3 rounded-lg border px-4 py-3',
              checked
                ? 'border-brand bg-brand-muted'
                : 'border-border bg-surface active:bg-surface-pressed',
              option.disabled && 'opacity-50',
            )}
          >
            <View
              className={cn(
                'h-5 w-5 items-center justify-center rounded-full border-2',
                checked ? 'border-brand' : 'border-border-strong',
              )}
            >
              {checked ? <View className="h-2 w-2 rounded-full bg-brand" /> : null}
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="body">{option.label}</Text>
              {option.description ? (
                <Text variant="caption" tone="muted">
                  {option.description}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
