import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { AI_DISCLAIMER } from '@/constants/copy';
import { cn } from '@/lib/cn';

/** Fixed notice shown next to AI-generated content. */
export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <View
      accessible
      accessibilityLabel={AI_DISCLAIMER}
      className={cn('flex-row items-center gap-1.5', className)}
    >
      <Icon name="info" size={16} color={colors.foreground.subtle} />
      <Text variant="caption" tone="subtle" className="flex-1">
        {AI_DISCLAIMER}
      </Text>
    </View>
  );
}
