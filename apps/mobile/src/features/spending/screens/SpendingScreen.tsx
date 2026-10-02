import { PlaceholderScreen, PlaceholderSummary } from '@/components/layout';
import { Text } from '@/components/ui';

import { useTransactions } from '../api';

// Temporary: proves the paginated data layer until the real screen is built.
export function SpendingScreen() {
  const transactions = useTransactions();
  return (
    <PlaceholderScreen title="Gastos">
      <PlaceholderSummary query={transactions}>
        {(data) => {
          const loaded = data.pages.reduce((total, page) => total + page.items.length, 0);
          return (
            <Text variant="body" tone="muted">
              {loaded === 1 ? '1 lançamento carregado' : `${loaded} lançamentos carregados`}
            </Text>
          );
        }}
      </PlaceholderSummary>
    </PlaceholderScreen>
  );
}
