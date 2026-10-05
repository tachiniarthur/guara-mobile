import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { Icon, IconButton, MoneyInput, Span, Text } from '@/components/ui';

export interface MilestoneInputsProps {
  values: (Cents | null)[];
  onChange: (values: (Cents | null)[]) => void;
  max?: number;
}

/** "Avisos antes do teto": numbered amount fields with remove and "Adicionar aviso". */
export function MilestoneInputs({ values, onChange, max = 3 }: MilestoneInputsProps) {
  return (
    <View accessibilityLabel="Avisos antes do teto" className="gap-2.5">
      <Text variant="label" className="mb-1">
        Avisos antes do teto{' '}
        <Span weight="regular" tone="subtle">
          (opcional)
        </Span>
      </Text>
      <View className="gap-2">
        {values.map((value, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-full border border-border-strong">
              <Text size={13} weight="bold" tone="muted">
                {index + 1}
              </Text>
            </View>
            <MoneyInput
              size={48}
              value={value}
              onChangeValue={(next) =>
                onChange(values.map((item, i) => (i === index ? next : item)))
              }
              accessibilityLabel={`Aviso ${index + 1}, valor`}
              containerClassName="flex-1"
            />
            <IconButton
              icon="trash"
              accessibilityLabel={`Remover aviso ${index + 1}`}
              onPress={() => onChange(values.filter((_, i) => i !== index))}
            />
          </View>
        ))}
      </View>
      {values.length < max ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange([...values, null])}
          className="h-12 flex-row items-center justify-center gap-2 rounded-full border border-dashed border-border-strong active:bg-surface-pressed"
        >
          <Icon name="plus" size={18} color={colors.foreground.DEFAULT} />
          <Text size={15} weight="bold">
            Adicionar aviso
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
