import { colors } from '@guara/ui-tokens';
import { Pressable, ScrollView } from 'react-native';

import { Chip, Icon, Text } from '@/components/ui';

import { PERIODS, type ReportPeriod } from '../data';

export interface PeriodChipsProps {
  value: ReportPeriod;
  onChange: (value: ReportPeriod) => void;
  onCustom: () => void;
}

/** Report period: 7 dias · Este mês · 3 meses · 12 meses · Personalizado. */
export function PeriodChips({ value, onChange, onCustom }: PeriodChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Período"
      contentContainerClassName="gap-1.5"
    >
      {PERIODS.map((period) => (
        <Chip
          key={period.value}
          label={period.label}
          size={40}
          appearance="filled"
          selected={value === period.value}
          onPress={() => onChange(period.value)}
        />
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={onCustom}
        className="h-10 flex-row items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3.5 active:bg-surface-pressed"
      >
        <Icon name="calendar" size={16} color={colors.foreground.muted} />
        <Text size={14} tone="muted">
          Personalizado
        </Text>
      </Pressable>
    </ScrollView>
  );
}
