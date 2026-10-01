import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function AssetDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  return <PlaceholderScreen title="Ativo" subtitle={ticker} />;
}
