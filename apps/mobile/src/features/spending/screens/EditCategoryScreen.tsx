import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function EditCategoryScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  return <PlaceholderScreen title="Editar categoria" subtitle={transactionId} />;
}
