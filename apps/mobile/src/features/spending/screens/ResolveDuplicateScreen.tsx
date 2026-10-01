import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function ResolveDuplicateScreen() {
  const { duplicateId } = useLocalSearchParams<{ duplicateId: string }>();
  return <PlaceholderScreen title="Lançamento duplicado" subtitle={duplicateId} />;
}
