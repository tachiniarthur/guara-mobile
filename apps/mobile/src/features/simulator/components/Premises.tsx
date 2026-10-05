import type { ReactNode } from 'react';
import { View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { Chip, Slider, Text, type SliderProps } from '@/components/ui';

/** "Premissas": the inputs of the simulation and a summary at the bottom. */
export function PremisesCard({
  children,
  summary,
}: {
  children: ReactNode;
  summary: readonly { label: string; value: string }[];
}) {
  return (
    <SectionCard
      title="Premissas"
      description="Mexa e o resultado muda na hora"
      titleSize={18}
      gap={16}
    >
      {children}
      <View className="gap-2 rounded-16 bg-surface-input px-4 py-3.5">
        <Text size={12} weight="bold" tracking={0.06} tone="subtle">
          RESUMO
        </Text>
        {summary.map((row) => (
          <View key={row.label} className="flex-row justify-between gap-3">
            <Text size={14} tone="muted">
              {row.label}
            </Text>
            <Text size={14} weight="bold" align="right" tabular className="shrink">
              {row.value}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

export interface SliderFieldProps extends Omit<SliderProps, 'accessibilityLabel' | 'valueText'> {
  label: string;
  /** Formatted value on the right ("25 anos"). */
  display: string;
  caption: string;
}

/** Labeled range with its value and a caption ("Aposentar em 2051"). */
export function SliderField({ label, display, caption, ...slider }: SliderFieldProps) {
  return (
    <View className="min-w-0 gap-1.5">
      <View className="flex-row justify-between gap-2">
        <Text size={14} weight="bold">
          {label}
        </Text>
        <Text size={14} weight="bold" tabular>
          {display}
        </Text>
      </View>
      <Slider accessibilityLabel={label} valueText={display} {...slider} />
      <Text size={12} tone="subtle">
        {caption}
      </Text>
    </View>
  );
}

export interface ChipFieldProps<K extends string> {
  label: string;
  options: readonly { key: K; label: string }[];
  isSelected: (key: K) => boolean;
  onPress: (key: K) => void;
}

/** Group of 36-tall chips ("Incluir na conta", "Onde guardar"). */
export function ChipField<K extends string>({
  label,
  options,
  isSelected,
  onPress,
}: ChipFieldProps<K>) {
  return (
    <View className="gap-2">
      <Text size={14} weight="bold">
        {label}
      </Text>
      <View accessibilityLabel={label} className="flex-row flex-wrap gap-1.5">
        {options.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            size={36}
            selected={isSelected(option.key)}
            onPress={() => onPress(option.key)}
          />
        ))}
      </View>
    </View>
  );
}
