import { colors } from '@guara/ui-tokens';
import { Pressable } from 'react-native';

import { MataSurface } from '@/components/illustrations';
import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface NewConversationButtonProps {
  onPress: () => void;
  /** `full` (phone list, 48 tall), `pill` (tablet header, 44) or `icon` (44 round). */
  variant?: 'full' | 'pill' | 'icon';
}

/** "Nova conversa" over the mata texture. */
export function NewConversationButton({ onPress, variant = 'full' }: NewConversationButtonProps) {
  const isIcon = variant === 'icon';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Nova conversa"
      onPress={onPress}
      className={cn(variant === 'full' && 'self-stretch', 'active:opacity-90')}
    >
      <MataSurface
        style={{ borderColor: colors.avatarRing }}
        veil={isIcon ? [0.35, 0.35, 0.35] : [0.78, 0.45, 0.15]}
        className={cn(
          'flex-row items-center justify-center gap-2 rounded-full border',
          variant === 'full' && 'h-12 px-4.5',
          variant === 'pill' && 'h-11 px-4.5',
          isIcon && 'h-11 w-11',
        )}
      >
        <Icon name="plus" size={18} color={colors.foreground.DEFAULT} />
        {isIcon ? null : (
          <Text size={15} weight="bold">
            Nova conversa
          </Text>
        )}
      </MataSurface>
    </Pressable>
  );
}
