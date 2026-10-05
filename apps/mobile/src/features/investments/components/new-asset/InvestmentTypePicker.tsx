import { Pressable, View } from 'react-native';

import { ResponsiveGrid } from '@/components/layout';
import { Chip, Text } from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/cn';

import { INVESTMENT_TYPES, type InvestmentType } from '../../new-asset';

export interface InvestmentTypePickerProps {
  value: InvestmentType;
  onChange: (value: InvestmentType) => void;
  /** Tablet: segmented panel with 3 columns; phone: chips in 2 columns. */
  wide?: boolean;
}

/** "Tipo" of the new investment. */
export function InvestmentTypePicker({ value, onChange, wide = false }: InvestmentTypePickerProps) {
  if (!wide) {
    return (
      <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de investimento">
        <ResponsiveGrid columns={{ phone: 2, tablet: 2 }} gap={8}>
          {INVESTMENT_TYPES.map((type) => (
            <Chip
              key={type.key}
              label={type.label}
              size={44}
              appearance="filled"
              fill
              selected={type.key === value}
              onPress={() => onChange(type.key)}
            />
          ))}
        </ResponsiveGrid>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Tipo de investimento"
      className="rounded-16 bg-surface-muted p-1"
    >
      <ResponsiveGrid columns={{ tablet: 3 }} gap={4}>
        {INVESTMENT_TYPES.map((type) => {
          const selected = type.key === value;
          return (
            <Pressable
              key={type.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => {
                if (selected) return;
                haptics.selection();
                onChange(type.key);
              }}
              className={cn(
                'h-11 items-center justify-center rounded-full px-3',
                selected ? 'bg-surface' : 'active:bg-surface-pressed',
              )}
            >
              <Text
                size={14}
                weight={selected ? 'bold' : 'medium'}
                tone={selected ? 'default' : 'muted'}
                numberOfLines={1}
              >
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </ResponsiveGrid>
    </View>
  );
}
