import { colors, iconSize } from '@guara/ui-tokens';
import { WifiOffIcon } from 'lucide-react-native';
import { View } from 'react-native';

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
  if (!(visible ?? !online)) return null;

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className={cn('flex-row items-center gap-2 rounded-lg bg-warning-muted px-3 py-2', className)}
    >
      <WifiOffIcon size={iconSize.sm} color={colors.warning.DEFAULT} />
      <Text variant="caption" tone="warning" className="flex-1">
        {FEEDBACK_COPY.offline}
      </Text>
    </View>
  );
}
