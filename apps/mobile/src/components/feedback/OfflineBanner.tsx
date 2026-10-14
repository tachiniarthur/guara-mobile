import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { useHasOverlay } from '@/components/layout/ScreenOverlay';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { FEEDBACK_COPY } from '@/constants/copy';
import { useOnline } from '@/hooks/useOnline';
import { cn } from '@/lib/cn';

export interface OfflineBannerProps {
  /** Force visibility (previews). Default: follows the connection state. */
  visible?: boolean;
  className?: string;
}

/** Shown only while the device is offline. */
export function OfflineBanner({ visible, className }: OfflineBannerProps) {
  const online = useOnline();
  // A screen state notification ("Sem internet") already says it.
  const covered = useHasOverlay();
  if (!(visible ?? (!online && !covered))) return null;

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={cn('flex-row items-center gap-2 rounded-14 bg-warning-muted px-3 py-2', className)}
    >
      <Icon name="alertTriangle" size={16} color={colors.warning.DEFAULT} />
      <Text variant="caption" tone="warning" className="flex-1">
        {FEEDBACK_COPY.offline}
      </Text>
    </View>
  );
}
