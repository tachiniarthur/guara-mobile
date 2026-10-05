import type { Cents } from '@guara/types';
import { View } from 'react-native';

import { MoneyText, Text } from '@/components/ui';
import { BudgetMilestoneBar } from '@/features/budgets';

export interface ChatBudgetCardProps {
  label: string;
  spent: Cents;
  limit: Cents;
  milestones: Cents[];
}

/** Budget snapshot inside an answer ("Alimentação · setembro  R$ 742,18"). */
export function ChatBudgetCard({ label, spent, limit, milestones }: ChatBudgetCardProps) {
  return (
    <View className="gap-2.5 rounded-16 border border-border bg-surface p-3.5">
      <View className="flex-row items-baseline justify-between">
        <Text variant="caption" tone="subtle">
          {label}
        </Text>
        <MoneyText value={spent} serif weight="bold" size={20} tracking={-0.01} />
      </View>
      <BudgetMilestoneBar spent={spent} limit={limit} milestones={milestones} />
    </View>
  );
}
