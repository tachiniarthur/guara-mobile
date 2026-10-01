import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function TransactionDetailScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  return <PlaceholderScreen title="Lançamento" subtitle={transactionId} />;
}
