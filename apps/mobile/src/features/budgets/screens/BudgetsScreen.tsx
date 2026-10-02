import { PlaceholderScreen, PlaceholderSummary } from '@/components/layout';
import { Text } from '@/components/ui';

import { useBudgets } from '../api';

// Temporary: proves the data layer end to end until the real screen is built.
export function BudgetsScreen() {
  const budgets = useBudgets();
  return (
    <PlaceholderScreen title="Tetos de gasto">
      <PlaceholderSummary query={budgets}>
        {(data) => {
          const count = (status: string) =>
            data.items.filter((item) => item.status === status).length;
          return (
            <Text variant="body" tone="muted">
              {data.items.length === 1 ? '1 teto' : `${data.items.length} tetos`} ·{' '}
              {count('warning')} em alerta · {count('exceeded')}{' '}
              {count('exceeded') === 1 ? 'estourado' : 'estourados'}
            </Text>
          );
        }}
      </PlaceholderSummary>
    </PlaceholderScreen>
  );
}
