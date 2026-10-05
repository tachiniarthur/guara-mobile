import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  /** Leading button: back arrow, close (forms) or none (keeps the title centered). */
  leading?: 'back' | 'close' | 'none';
  /** Where the leading button goes. Default: back in the history (or this fallback). */
  fallbackHref?: Href;
  onLeadingPress?: () => void;
  /** Replaces the centered title (the app logo on Início). */
  start?: ReactNode;
  /** Right-side actions (`IconButton`s, the account button). */
  actions?: ReactNode;
  className?: string;
}

/** Phone header of the design: 60 tall, 44 buttons, centered bold title. */
export function TopBar({
  title,
  subtitle,
  leading = 'back',
  fallbackHref,
  onLeadingPress,
  start,
  actions,
  className,
}: TopBarProps) {
  const router = useRouter();
  const goBack = () => {
    if (onLeadingPress) return onLeadingPress();
    if (router.canGoBack()) return router.back();
    if (fallbackHref) router.replace(fallbackHref);
  };

  return (
    <View className={cn('h-[60px] flex-row items-center gap-2 px-2', className)}>
      {start ? (
        <View className="flex-1 pl-2">{start}</View>
      ) : (
        <>
          {leading === 'none' ? (
            <View className="w-11" />
          ) : (
            <IconButton
              icon={leading === 'close' ? 'close' : 'chevronLeft'}
              accessibilityLabel={leading === 'close' ? 'Fechar' : 'Voltar'}
              onPress={goBack}
            />
          )}
          <View className="min-w-0 flex-1 items-center">
            {title ? (
              <Text
                size={16}
                weight="bold"
                leading={1.3}
                accessibilityRole="header"
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text variant="micro" tone="subtle" leading={1.3} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </>
      )}
      <View className="min-w-11 flex-row items-center justify-end gap-1">{actions}</View>
    </View>
  );
}
