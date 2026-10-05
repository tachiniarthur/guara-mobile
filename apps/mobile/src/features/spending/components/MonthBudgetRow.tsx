import { View } from 'react-native';

import { budgetTone, MoneyText, Text } from '@/components/ui';
import { BudgetMilestoneBar } from '@/features/budgets';

import type { BudgetWithMilestones } from '../data';

const STATE_LABEL = { positive: 'tranquilo', warning: 'atenção', negative: 'apertado' } as const;
const TONE = { positive: 'subtle', warning: 'warning', negative: 'negative' } as const;

/** Cap of a category with its warning marks and month state ("74% · atenção"). */
export function MonthBudgetRow({ category, spent, limit, milestones }: BudgetWithMilestones) {
  const percent = Math.round((spent / limit) * 100);
  const tone = budgetTone(percent);
  const key = tone === 'warning' || tone === 'negative' ? tone : 'positive';
  return (
    <View className="gap-2.5">
      <View className="flex-row items-baseline justify-between gap-2">
        <Text size={15} weight="bold">
          {category}
        </Text>
        <Text size={14} tone="muted" tabular>
          <MoneyText value={spent} wholeUnits size={14} weight="bold" /> de{' '}
          <MoneyText value={limit} wholeUnits size={14} tone="muted" />
        </Text>
      </View>
      <BudgetMilestoneBar spent={spent} limit={limit} milestones={milestones} />
      <Text size={12} weight={key === 'positive' ? 'medium' : 'bold'} tone={TONE[key]}>
        {percent}% · {STATE_LABEL[key]}
      </Text>
    </View>
  );
}
