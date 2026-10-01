import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function BudgetDetailScreen() {
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>();
  return <PlaceholderScreen title="Teto de gasto" subtitle={budgetId} />;
}
