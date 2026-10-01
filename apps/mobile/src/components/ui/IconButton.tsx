import { colors, iconSize, type ControlSize } from '@guara/ui-tokens';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

import { hitSlopFor } from './touch';

const iconButtonVariants = cva('items-center justify-center rounded-full', {
  variants: {
    variant: {
      ghost: 'bg-transparent active:bg-surface-pressed',
      secondary: 'border border-border-strong bg-surface active:bg-surface-pressed',
      primary: 'bg-brand-solid active:bg-brand-pressed',
    },
    size: {
      sm: 'h-control-sm w-control-sm',
      md: 'h-control-md w-control-md',
      lg: 'h-control-lg w-control-lg',
    } satisfies Record<ControlSize, string>,
    disabled: { true: 'opacity-50', false: '' },
  },
});

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'disabled'> {
  icon: LucideIcon;
  /** Required: describes the action for screen readers ("Voltar", "Limpar busca"). */
  accessibilityLabel: string;
  variant?: 'ghost' | 'secondary' | 'primary';
  size?: ControlSize;
  disabled?: boolean;
  className?: string;
}

/** Icon-only button with a 44×44 minimum touch target. */
export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className,
  ...props
}: IconButtonProps) {
  const color = variant === 'primary' ? colors.brand.foreground : colors.foreground.DEFAULT;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={hitSlopFor(size)}
      className={cn(iconButtonVariants({ variant, size, disabled }), className)}
      {...props}
    >
      <Icon size={size === 'sm' ? iconSize.sm : iconSize.md} color={color} />
    </Pressable>
  );
}
