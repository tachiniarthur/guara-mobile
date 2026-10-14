import { colors, type ControlSize } from '@guara/ui-tokens';
import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Pressable, View, type GestureResponderEvent, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { Icon, type IconName } from './Icon';
import { useSkeleton } from './SkeletonScope';
import { Spinner } from './Spinner';
import { Text } from './Text';
import { hitSlopFor } from './touch';

/**
 * - `primary`: Tucano, the main action of the screen ("Criar conta", "Salvar").
 * - `inverse`: Areia, the main action of a step that is not the final one ("Continuar").
 * - `secondary`: filled dark with an outline ("Continuar com Google").
 * - `outline`: transparent with an outline ("Ver", "Criar alerta").
 * - `ghost`: text only ("Pular").
 * - `destructive`: Urucum ("Excluir").
 * - `negativeOutline`: Urucum text with a dark red outline ("Não reconheço").
 */
export type ButtonVariant =
  'primary' | 'inverse' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'negativeOutline';

const containerVariants = cva('flex-row items-center justify-center gap-2 rounded-full border', {
  variants: {
    variant: {
      primary: 'border-brand bg-brand active:bg-brand-pressed',
      inverse: 'border-foreground bg-foreground active:opacity-90',
      secondary: 'border-border-strong bg-surface active:bg-surface-pressed',
      outline: 'border-border-strong bg-transparent active:bg-surface-pressed',
      ghost: 'border-transparent bg-transparent active:bg-surface-pressed',
      destructive: 'border-negative bg-negative active:bg-negative-pressed',
      negativeOutline: 'border-negative-border bg-transparent active:bg-surface-pressed',
    } satisfies Record<ButtonVariant, string>,
    size: {
      sm: 'h-control-sm px-3',
      md: 'h-control-md px-3.5',
      lg: 'h-control-lg px-4.5',
    } satisfies Record<ControlSize, string>,
    fullWidth: { true: 'self-stretch', false: 'self-start' },
    disabled: { true: 'border-transparent bg-disabled-background', false: '' },
  },
});

/** Token colors for the label, icons and spinner. */
const CONTENT_COLOR: Record<ButtonVariant, string> = {
  primary: colors.brand.foreground,
  inverse: colors.foreground.inverse,
  secondary: colors.foreground.DEFAULT,
  outline: colors.foreground.DEFAULT,
  ghost: colors.foreground.DEFAULT,
  destructive: colors.negative.foreground,
  negativeOutline: colors.negative.DEFAULT,
};

const LABEL_SIZE: Record<ControlSize, number> = { sm: 13, md: 14, lg: 15 };

export interface ButtonProps extends Omit<PressableProps, 'children' | 'disabled'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Shows a spinner and blocks presses. */
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /** Haptic feedback on press (default: on for `primary`). */
  haptic?: boolean;
  className?: string;
}

/** Pill button of the design (Figtree 700, 44 or 52 tall). */
export function Button({
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  haptic = variant === 'primary',
  className,
  onPress,
  accessibilityLabel,
  style,
  ...props
}: ButtonProps) {
  const skeleton = useSkeleton();
  const isDisabled = disabled || loading;
  const contentColor = isDisabled ? colors.disabled.foreground : CONTENT_COLOR[variant];

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
      style={
        skeleton
          ? { backgroundColor: colors.skeleton.surface, borderColor: colors.skeleton.border }
          : style
      }
    >
      {loading ? (
        <Spinner color={contentColor} />
      ) : leftIcon ? (
        <Icon name={leftIcon} size={18} color={contentColor} />
      ) : null}
      {typeof children === 'string' ? (
        <Text
          variant="label"
          size={LABEL_SIZE[size]}
          numberOfLines={1}
          style={{ color: contentColor }}
        >
          {children}
        </Text>
      ) : (
        <View className="flex-row items-center gap-2">{children}</View>
      )}
      {rightIcon && !loading ? <Icon name={rightIcon} size={18} color={contentColor} /> : null}
    </Pressable>
  );
}
