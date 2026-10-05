import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button, type ButtonVariant } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
  /** Design: `secondary` ("Limpar filtros") or `primary` ("Conectar banco"). */
  variant?: ButtonVariant;
  icon?: IconName;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  /** `negative`: Urucum circle (errors). */
  tone?: 'neutral' | 'negative';
  action?: EmptyStateAction;
  /** Custom buttons instead of `action` ("Criar primeira meta" + "Usar o simulador"). */
  actions?: ReactNode;
  className?: string;
}

/** List/screen state of the design: 64 circle, Fraunces title, short text and one action. */
export function EmptyState({
  title,
  description,
  icon,
  tone = 'neutral',
  action,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn('items-center gap-3 px-4 py-7', className)}>
      {icon ? (
        <View
          className={cn(
            'h-16 w-16 items-center justify-center rounded-full',
            tone === 'negative' ? 'bg-negative-muted' : 'bg-surface-muted',
          )}
        >
          <Icon
            name={icon}
            size={28}
            color={tone === 'negative' ? colors.negative.DEFAULT : colors.foreground.muted}
          />
        </View>
      ) : null}
      <Text serif weight="bold" size={20} leading={1.25} align="center" accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text size={14} leading={1.55} tone="muted" align="center" className="max-w-[320px]">
          {description}
        </Text>
      ) : null}
      {actions ? <View className="flex-row flex-wrap justify-center gap-2">{actions}</View> : null}
      {action ? (
        <Button
          variant={action.variant ?? 'secondary'}
          size="md"
          leftIcon={action.icon}
          onPress={action.onPress}
          className="self-center"
        >
          {action.label}
        </Button>
      ) : null}
    </View>
  );
}
