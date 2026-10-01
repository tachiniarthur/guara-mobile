import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function SubscriptionDetailScreen() {
  const { subscriptionId } = useLocalSearchParams<{ subscriptionId: string }>();
  return <PlaceholderScreen title="Assinatura" subtitle={subscriptionId} />;
}
