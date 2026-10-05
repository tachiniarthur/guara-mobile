import { colors } from '@guara/ui-tokens';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface DisclosureProps {
  title: string;
  children: ReactNode;
  icon?: IconName;
  defaultOpen?: boolean;
  /** Musgo line above (default true). */
  divider?: boolean;
  className?: string;
}

/** Expandable explanation ("Por que perguntamos isso?"), like HTML details/summary. */
export function Disclosure({
  title,
  children,
  icon = 'infoLarge',
  defaultOpen = false,
  divider = true,
  className,
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View className={cn(divider && 'border-t border-border pt-2', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        className="min-h-11 flex-row items-center gap-2"
      >
        <Icon name={icon} size={18} color={colors.foreground.DEFAULT} />
        <Text size={15} weight="bold" className="flex-1">
          {title}
        </Text>
        <Icon
          name={open ? 'chevronDown' : 'chevronRight'}
          size={16}
          color={colors.foreground.subtle}
        />
      </Pressable>
      {open ? <View className="mt-1">{children}</View> : null}
    </View>
  );
}
