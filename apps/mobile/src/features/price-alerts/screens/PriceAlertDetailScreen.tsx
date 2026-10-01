import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function PriceAlertDetailScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  return <PlaceholderScreen title="Alerta de preço" subtitle={alertId} />;
}
