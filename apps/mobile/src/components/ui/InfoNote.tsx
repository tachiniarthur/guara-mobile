import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type InfoNoteTone = 'neutral' | 'warning' | 'positive' | 'negative' | 'plain';

const BOX: Record<InfoNoteTone, string> = {
  neutral: 'rounded-16 bg-surface-muted p-3.5',
  warning: 'rounded-14 bg-warning-muted px-3.5 py-3',
  positive: 'rounded-14 bg-positive-muted px-3.5 py-3',
  negative: 'rounded-14 bg-negative-muted px-3.5 py-3',
  plain: '',
};

const ICON_COLOR: Record<InfoNoteTone, string> = {
  neutral: colors.foreground.DEFAULT,
  warning: colors.warning.DEFAULT,
  positive: colors.positive.DEFAULT,
  negative: colors.negative.DEFAULT,
  plain: colors.brand.DEFAULT,
};

export interface InfoNoteProps {
  icon: IconName;
  children: ReactNode;
  tone?: InfoNoteTone;
  /** Text size (design: 13 or 14). */
  size?: number;
  iconColor?: string;
  className?: string;
}

/** Icon + short explanation ("Conexão pelo Open Finance Brasil…", warnings in forms). */
export function InfoNote({
  icon,
  children,
  tone = 'neutral',
  size = 14,
  iconColor,
  className,
}: InfoNoteProps) {
  const textTone = tone === 'plain' || tone === 'neutral' ? 'muted' : 'default';
  return (
    <View
      className={cn(
        'flex-row items-start gap-2.5',
        tone === 'plain' && 'gap-2',
        BOX[tone],
        className,
      )}
    >
      <View style={{ marginTop: 2 }}>
        <Icon name={icon} size={16} color={iconColor ?? ICON_COLOR[tone]} />
      </View>
      {typeof children === 'string' ? (
        <Text size={size} tone={textTone} className="flex-1">
          {children}
        </Text>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </View>
  );
}
