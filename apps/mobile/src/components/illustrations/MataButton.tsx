import { colors } from '@guara/ui-tokens';
import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

import { MataSurface } from './MataSurface';

export interface MataButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  /** Height in dp (design: 48 full width, 44 in empty states and tablet headers). */
  size?: 44 | 48;
  fullWidth?: boolean;
}

/** Pill over the mata texture ("Nova meta", "Criar primeira meta"). */
export function MataButton({
  label,
  onPress,
  icon = 'plus',
  size = 48,
  fullWidth = false,
}: MataButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(fullWidth ? 'self-stretch' : 'self-center', 'active:opacity-90')}
    >
      <MataSurface
        style={{ borderColor: colors.avatarRing }}
        className={cn(
          'flex-row items-center justify-center gap-2 rounded-full border px-4.5',
          size === 48 ? 'h-12' : 'h-11',
        )}
      >
        <Icon name={icon} size={18} color={colors.foreground.DEFAULT} />
        <Text size={15} weight="bold">
          {label}
        </Text>
      </MataSurface>
    </Pressable>
  );
}
