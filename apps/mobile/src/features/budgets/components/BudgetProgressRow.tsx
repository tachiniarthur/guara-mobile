import type { Cents } from '@guara/types';
import { View } from 'react-native';

import { budgetTone, MoneyText, ProgressBar, Text } from '@/components/ui';
import { formatCents } from '@guara/utils';

export interface BudgetProgressRowProps {
  category: string;
  spent: Cents;
  limit: Cents;
  /** `stacked` (phone): name and values above the bar. `inline` (tablet): one line. */
  layout?: 'stacked' | 'inline';
}

const TONE_TEXT = { positive: 'positive', warning: 'warning', negative: 'negative' } as const;

/** Category spending against its cap: "Alimentação · R$ 742 de R$ 1.000 · 74%". */
export function BudgetProgressRow({
  category,
  spent,
  limit,
  layout = 'stacked',
}: BudgetProgressRowProps) {
  const percent = Math.round((spent / limit) * 100);
  const tone = budgetTone(percent);
  const toneKey =
    tone === 'positive' || tone === 'warning' || tone === 'negative' ? tone : 'positive';
  const label = `${category}: ${formatCents(spent, { wholeUnits: true })} de ${formatCents(limit, { wholeUnits: true })}, ${percent}%`;

  const values = (
    <View className="flex-row items-center justify-end gap-2">
      <Text size={14} tone="muted" tabular numberOfLines={1}>
        <MoneyText value={spent} wholeUnits size={14} weight="bold" /> de{' '}
        <MoneyText value={limit} wholeUnits size={14} tone="muted" />
      </Text>
      <Text
        size={14}
        weight="extrabold"
        tone={TONE_TEXT[toneKey]}
        tabular
        className="min-w-[52px] text-right"
      >
        {percent}%
      </Text>
    </View>
  );

  if (layout === 'inline') {
    return (
      <View
        accessible
        accessibilityLabel={label}
        className="min-h-[42px] flex-row items-center gap-4"
      >
        <Text size={15} weight="bold" className="w-[116px]">
          {category}
        </Text>
        <View className="flex-1">
          <ProgressBar percent={percent} tone={tone} height={14} />
        </View>
        <View className="w-[200px]">{values}</View>
      </View>
    );
  }

  return (
    <View accessible accessibilityLabel={label} className="gap-1.5 py-1.5">
      <View className="flex-row items-center justify-between gap-3">
        <Text size={15} weight="bold">
          {category}
        </Text>
        {values}
      </View>
      <ProgressBar percent={percent} tone={tone} height={10} />
    </View>
  );
}
