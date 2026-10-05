import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

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
}

/** Standard surface. With `onPress` it becomes a pressable card. */
export function Card({ children, variant, padding, onPress, className, ...props }: CardProps) {
  const classes = cn(cardVariants({ variant, padding }), className);
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={cn(classes, 'active:bg-surface-pressed')}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
}
