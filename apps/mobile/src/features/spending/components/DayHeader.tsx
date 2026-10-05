import type { Cents } from '@guara/types';
import { formatCentsForSpeech } from '@guara/utils';
import { View } from 'react-native';

import { MoneyText, Text } from '@/components/ui';

export interface DayHeaderProps {
  /** "Hoje · 23 de setembro" (shown in caps). */
  label: string;
  /** Signed total of the day. */
  total: Cents;
}

/** Day separator of the transaction lists, with the day's balance on the right. */
export function DayHeader({ label, total }: DayHeaderProps) {
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${label}, ${total > 0 ? 'mais ' : ''}${formatCentsForSpeech(total)}`}
      className="mt-3.5 flex-row items-baseline justify-between gap-3"
    >
      <Text size={12} weight="bold" tracking={0.08} tone="subtle" numberOfLines={1}>
        {label.toLocaleUpperCase('pt-BR')}
      </Text>
      <MoneyText value={total} showSign size={12} weight="bold" tone="subtle" />
    </View>
  );
}
