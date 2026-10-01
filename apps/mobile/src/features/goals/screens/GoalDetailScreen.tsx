import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/layout';

export function GoalDetailScreen() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  return <PlaceholderScreen title="Meta" subtitle={goalId} />;
}
