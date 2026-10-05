import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  action?: { label: string; onPress: () => void };
  className?: string;
}

/** Friendly empty list/screen with an optional call to action. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <View className={cn('items-center gap-3 px-6 py-10', className)}>
      {icon ? (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
          <Icon name={icon} size={24} color={colors.foreground.muted} />
        </View>
      ) : null}
      <Text variant="heading" align="center" accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text variant="body" tone="muted" align="center">
          {description}
        </Text>
      ) : null}
      {action ? (
        <Button variant="outline" size="md" onPress={action.onPress} className="mt-2 self-center">
          {action.label}
        </Button>
      ) : null}
    </View>
  );
}
