import { ChevronLeftIcon } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Right-side actions (usually `IconButton`s). */
  actions?: ReactNode;
  /** Back button. Default: shown when there is a screen to go back to. */
  showBack?: boolean;
  onBack?: () => void;
  /** Bigger title for tab roots ("Gastos", "Investimentos"). */
  large?: boolean;
  /**
   * `inline` (default) draws the header inside the screen — for routes whose stack header is
   * hidden (tab roots). `native` only configures the Expo Router stack header (title + actions)
   * and renders nothing, so headers are never duplicated.
   */
  mode?: 'inline' | 'native';
  className?: string;
}

export function Header({
  title,
  subtitle,
  actions,
  showBack,
  onBack,
  large = false,
  mode = 'inline',
  className,
}: HeaderProps) {
  const router = useRouter();

  if (mode === 'native') {
    return (
      <Stack.Screen
        options={{
          headerTitle: title ?? '',
          headerRight: actions ? () => actions : undefined,
        }}
      />
    );
  }

  const canGoBack = showBack ?? router.canGoBack();

  return (
    <View className={cn('min-h-touch flex-row items-center gap-2', className)}>
      {canGoBack ? (
        <IconButton
          icon={ChevronLeftIcon}
          accessibilityLabel="Voltar"
          onPress={onBack ?? (() => router.back())}
          className="-ml-2"
        />
      ) : null}
      <View className="flex-1">
        {title ? (
          <Text variant={large ? 'title' : 'subtitle'} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions ? <View className="flex-row items-center gap-1">{actions}</View> : null}
    </View>
  );
}
