import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { haptics } from '@/lib/haptics';

import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface OptionSheetProps<V extends string> {
  open: boolean;
  onClose: () => void;
  title: string;
  options: readonly { value: V; label: string; description?: string }[];
  value: V;
  onChange: (value: V) => void;
}

/** Bottom sheet with a single-choice list (month, category, bank). */
export function OptionSheet<V extends string>({
  open,
  onClose,
  title,
  options,
  value,
  onChange,
}: OptionSheetProps<V>) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <View accessibilityRole="radiogroup" accessibilityLabel={title}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => {
                haptics.selection();
                onChange(option.value);
                onClose();
              }}
              className="min-h-12 flex-row items-center gap-3 rounded-14 px-3 active:bg-surface-pressed"
            >
              <View className="flex-1">
                <Text size={15} weight={selected ? 'bold' : 'medium'}>
                  {option.label}
                </Text>
                {option.description ? (
                  <Text variant="caption" tone="subtle">
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {selected ? (
                <Icon name="check" size={18} strokeWidth={2.2} color={colors.foreground.DEFAULT} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
