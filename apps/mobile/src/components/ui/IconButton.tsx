import { colors } from '@guara/ui-tokens';
import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { hitSlopFor } from './touch';

export type IconButtonVariant = 'ghost' | 'outline' | 'filled' | 'primary';

const iconButtonVariants = cva('items-center justify-center rounded-full border', {
  variants: {
    variant: {
      ghost: 'border-transparent bg-transparent active:bg-surface-pressed',
      outline: 'border-border-strong bg-transparent active:bg-surface-pressed',
      filled: 'border-border-strong bg-surface active:bg-surface-pressed',
      primary: 'border-brand bg-brand active:bg-brand-pressed',
    } satisfies Record<IconButtonVariant, string>,
    disabled: { true: 'opacity-50', false: '' },
  },
});

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'disabled'> {
  icon: IconName;
  /** Required: describes the action for screen readers ("Voltar", "Limpar busca"). */
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  /** Diameter in dp (default 44). Smaller buttons still get a 44×44 target. */
  size?: number;
  iconSize?: number;
  /** Icon color override (default: muted text, or dark on `primary`). */
  color?: string;
  disabled?: boolean;
  /** Small dot or counter over the top-right corner (unread notifications). */
  badge?: ReactNode;
  className?: string;
}

/** Round icon-only button with a 44×44 minimum touch target. */
export function IconButton({
  icon,
  variant = 'ghost',
  size = 44,
  iconSize = 20,
  color,
  disabled = false,
  badge,
  className,
  ...props
}: IconButtonProps) {
  const iconColor =
    color ?? (variant === 'primary' ? colors.brand.foreground : colors.foreground.muted);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={hitSlopFor(size)}
      style={{ width: size, height: size }}
      className={cn(iconButtonVariants({ variant, disabled }), className)}
      {...props}
    >
      <Icon name={icon} size={iconSize} color={iconColor} />
      {badge ? <View className="absolute right-1.5 top-1.5">{badge}</View> : null}
    </Pressable>
  );
}
