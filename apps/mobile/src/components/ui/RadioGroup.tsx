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

/** The 22 radio circle (Areia when checked). */
export function RadioDot({ checked }: { checked: boolean }) {
  return (
    <View
      className={cn(
        'h-[22px] w-[22px] items-center justify-center rounded-full border-2',
        checked ? 'border-foreground' : 'border-foreground-subtle',
      )}
    >
      {checked ? <View className="h-3 w-3 rounded-full bg-foreground" /> : null}
    </View>
  );
}

/** Single choice from a list of option cards (investor-profile questions). */
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
      className={cn('gap-2.5', className)}
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
              'min-h-[60px] flex-row items-center gap-3.5 rounded-20 bg-surface-input px-4 py-2',
              checked ? 'border-2 border-foreground' : 'border border-border-strong',
              option.disabled && 'opacity-50',
            )}
          >
            <RadioDot checked={checked} />
            <View className="flex-1 gap-0.5">
              <Text size={16} weight={checked ? 'bold' : 'medium'}>
                {option.label}
              </Text>
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
