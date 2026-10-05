import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface StepIntroProps {
  title: string;
  description: string;
  /** Phone title size (design: 26, 28 on the welcome screen). Tablets use 30. */
  phoneSize?: number;
}

/** Fraunces title + intro paragraph of an onboarding step. */
export function StepIntro({ title, description, phoneSize = 26 }: StepIntroProps) {
  const { isTablet } = useBreakpoint();
  return (
    <View className="gap-2.5">
      <Text variant="title" size={isTablet ? 30 : phoneSize} accessibilityRole="header">
        {title}
      </Text>
      <Text variant="lead" tone="muted">
        {description}
      </Text>
    </View>
  );
}
