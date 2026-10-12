import { Pressable, View } from 'react-native';

import { budgetStateLabel, budgetTone, MoneyText, Text } from '@/components/ui';
// Straight to the file: the budgets feature imports Gastos back.
import { BudgetMilestoneBar } from '@/features/budgets/components/BudgetMilestoneBar';

import type { BudgetWithMilestones } from '../data';

const TONE = { positive: 'subtle', warning: 'warning', negative: 'negative' } as const;

/** Cap of a category with its warning marks and month state ("74% · atenção"). */
export function MonthBudgetRow({
  category,
  spent,
  limit,
  milestones,
  onPress,
}: BudgetWithMilestones & {
  /** Opens the cap (Teto de Alimentação). */
  onPress?: () => void;
}) {
  const percent = Math.round((spent / limit) * 100);
  const tone = budgetTone(percent);
  const key = tone === 'warning' || tone === 'negative' ? tone : 'positive';
  const Container = onPress ? Pressable : View;
  return (
    <Container
      {...(onPress
        ? {
            accessibilityRole: 'link' as const,
            accessibilityHint: 'Abre o teto',
            onPress,
          }
        : null)}
      className={onPress ? 'gap-2.5 active:opacity-80' : 'gap-2.5'}
    >
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
        {percent}% · {budgetStateLabel(percent)}
      </Text>
    </Container>
  );
}
