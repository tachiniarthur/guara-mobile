import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function BankConnectionDetailScreen() {
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>();
  return <PlaceholderScreen title="Conexão bancária" subtitle={connectionId} />;
}
