import { colors } from '@guara/ui-tokens';
import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { useScreenState } from '@/components/feedback/ScreenStates';
import { cn } from '@/lib/cn';

import { SkeletonScope } from './SkeletonScope';

/**
 * - `default`: Folha escura with a Musgo border, radius 24 (cards and panels).
 * - `muted`: Sombra, no border, radius 20 (notes, "O que o Guará acessa").
 * - `alert`: like `default` with an Urucum border (something needs the user).
 * - `outline`: transparent with a Líquen border.
 */
const cardVariants = cva('overflow-hidden', {
  variants: {
    variant: {
      default: 'rounded-24 border border-border bg-surface',
      muted: 'rounded-20 bg-surface-muted',
      alert: 'rounded-24 border border-negative bg-surface',
      outline: 'rounded-24 border border-border-strong bg-transparent',
    },
    padding: { none: '', sm: 'p-3.5', md: 'p-4.5', lg: 'p-6' },
  },
  defaultVariants: { variant: 'default', padding: 'md' },
});

export interface CardProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'muted' | 'alert' | 'outline';
  /** `md` = 18 (phone), `lg` = 24 (tablet). */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Makes the card pressable (role "button"). */
  onPress?: () => void;
  className?: string;
  /**
   * Inside `ScreenStates`, drawn as blocks while loading (default true). The body follows
   * the other states through `StateSlot`.
   */
  followsState?: boolean;
}

/** Standard surface. With `onPress` it becomes a pressable card. */
export function Card({
  children,
  variant,
  padding,
  onPress,
  className,
  followsState = true,
  style,
  ...props
}: CardProps) {
  const loading = useScreenState().status === 'loading' && followsState;
  const classes = cn(cardVariants({ variant, padding }), className);
  const loadingStyle = loading
    ? { backgroundColor: colors.skeleton.surface, borderColor: colors.skeleton.border }
    : null;
  if (onPress) {
    return (
      <SkeletonScope active={loading}>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          className={cn(classes, 'active:bg-surface-pressed')}
          style={[style, loadingStyle]}
          {...props}
        >
          {children}
        </Pressable>
      </SkeletonScope>
    );
  }
  return (
    <SkeletonScope active={loading}>
      <View className={classes} style={[style, loadingStyle]} {...props}>
        {children}
      </View>
    </SkeletonScope>
  );
}
