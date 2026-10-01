import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

const cardVariants = cva('rounded-xl border', {
  variants: {
    variant: {
      default: 'border-border bg-surface',
      elevated: 'border-border bg-background-elevated',
      outline: 'border-border-strong bg-transparent',
    },
    padding: { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' },
  },
  defaultVariants: { variant: 'default', padding: 'md' },
});

export interface CardProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
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
