import { PlaceholderScreen, PlaceholderSummary } from '@/components/layout';
import { MoneyText, Text } from '@/components/ui';

import { useDashboard } from '../api';

// Temporary: proves the data layer end to end until the real dashboard is built.
export function DashboardScreen() {
  const dashboard = useDashboard();
  return (
    <PlaceholderScreen title="Painel">
      <PlaceholderSummary query={dashboard}>
        {(data) => (
          <>
            <Text variant="caption" tone="muted">
              Saldo consolidado
            </Text>
            <MoneyText variant="subtitle" value={data.consolidatedBalance} />
            <Text variant="caption" tone="muted">
              {data.unreadNotifications === 1
                ? '1 aviso não lido'
                : `${data.unreadNotifications} avisos não lidos`}
            </Text>
          </>
        )}
      </PlaceholderSummary>
    </PlaceholderScreen>
  );
}
