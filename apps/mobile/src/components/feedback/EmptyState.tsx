import { colors, iconSize } from '@guara/ui-tokens';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
  className?: string;
}

/** Friendly empty list/screen with an optional call to action. */
export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <View className={cn('items-center gap-3 px-6 py-10', className)}>
      {Icon ? (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
          <Icon size={iconSize.lg} color={colors.foreground.muted} />
        </View>
      ) : null}
      <Text variant="subtitle" align="center" accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text variant="body" tone="muted" align="center">
          {description}
        </Text>
      ) : null}
      {action ? (
        <Button variant="secondary" onPress={action.onPress} className="mt-2 self-center">
          {action.label}
        </Button>
      ) : null}
    </View>
  );
}
