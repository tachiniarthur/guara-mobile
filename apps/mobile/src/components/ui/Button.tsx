import { colors, iconSize, type ControlSize } from '@guara/ui-tokens';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Spinner } from './Spinner';
import { Text } from './Text';
import { hitSlopFor } from './touch';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

const containerVariants = cva('flex-row items-center justify-center gap-2 rounded-lg border', {
  variants: {
    variant: {
      primary: 'border-transparent bg-brand-solid active:bg-brand-pressed',
      secondary: 'border-border-strong bg-surface active:bg-surface-pressed',
      ghost: 'border-transparent bg-transparent active:bg-surface-pressed',
      destructive: 'border-transparent bg-negative-solid active:bg-negative-pressed',
    },
    size: {
      sm: 'h-control-sm px-3',
      md: 'h-control-md px-4',
      lg: 'h-control-lg px-5',
    } satisfies Record<ControlSize, string>,
    fullWidth: { true: 'self-stretch', false: 'self-start' },
    disabled: { true: 'border-transparent bg-disabled-background', false: '' },
  },
});

const LABEL_CLASS: Record<ButtonVariant, string> = {
  primary: 'text-brand-foreground',
  secondary: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-negative-foreground',
};

/** Token colors for icons/spinner (they take a color prop, not a class). */
const CONTENT_COLOR: Record<ButtonVariant, string> = {
  primary: colors.brand.foreground,
  secondary: colors.foreground.DEFAULT,
  ghost: colors.foreground.DEFAULT,
  destructive: colors.negative.foreground,
};

export interface ButtonProps extends Omit<PressableProps, 'children' | 'disabled'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Shows a spinner and blocks presses. */
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Haptic feedback on press (default: on for `primary`). */
  haptic?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  haptic = variant === 'primary',
  className,
  onPress,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const contentColor = isDisabled ? colors.disabled.foreground : CONTENT_COLOR[variant];
  const iconPx = size === 'lg' ? iconSize.lg : iconSize.md;

  const handlePress = (event: GestureResponderEvent) => {
    if (haptic) haptics.impact();
    onPress?.(event);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={hitSlopFor(size)}
      onPress={handlePress}
      className={cn(
        containerVariants({ variant, size, fullWidth, disabled: isDisabled }),
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner color={contentColor} />
      ) : LeftIcon ? (
        <LeftIcon size={iconPx} color={contentColor} />
      ) : null}
      {typeof children === 'string' ? (
        <Text
          variant={size === 'lg' ? 'body' : 'label'}
          weight="semibold"
          numberOfLines={1}
          className={isDisabled ? 'text-disabled-foreground' : LABEL_CLASS[variant]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      {RightIcon && !loading ? <RightIcon size={iconPx} color={contentColor} /> : null}
    </Pressable>
  );
}
