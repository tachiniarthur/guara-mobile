import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

export interface SectionHeaderProps {
  title: string;
  /** Muted text beside the title ("Como está o seu mês"). */
  description?: string;
  /** Right side: a `LinkButton` or a metadata line ("Atualizado há 5 min"). */
  aside?: ReactNode;
  className?: string;
}

/** Section title (Fraunces 800, 22 on phones / 26 on tablets) with optional aside. */
export function SectionHeader({ title, description, aside, className }: SectionHeaderProps) {
  const { isTablet } = useBreakpoint();
  return (
    <View
      className={cn('flex-row flex-wrap items-baseline justify-between gap-x-4 gap-y-1', className)}
    >
      <View className="flex-row flex-wrap items-baseline gap-x-3.5 gap-y-0.5">
        <Text variant="section" size={isTablet ? 26 : 22} accessibilityRole="header">
          {title}
        </Text>
        {description ? (
          <Text size={15} tone="subtle">
            {description}
          </Text>
        ) : null}
      </View>
      {typeof aside === 'string' ? (
        <Text variant="caption" tone="subtle">
          {aside}
        </Text>
      ) : (
        aside
      )}
    </View>
  );
}

export interface SectionProps extends SectionHeaderProps {
  children: ReactNode;
  contentClassName?: string;
}

/** Titled block of content (gap 14 between header and body). */
export function Section({ children, contentClassName, className, ...header }: SectionProps) {
  return (
    <View className={cn('gap-3.5', className)}>
      <SectionHeader {...header} />
      <View className={contentClassName}>{children}</View>
    </View>
  );
}
