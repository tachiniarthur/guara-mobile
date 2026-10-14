import { colors } from '@guara/ui-tokens';
import { createContext, use, type ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

const SkeletonContext = createContext(false);

/**
 * "Carregando" drawn over the screen's own layout (Fundamentos · Estados): inside an active
 * scope, `Text` turns into blocks, icons and images disappear, and charts become flat areas.
 */
export function SkeletonScope({
  active,
  off = false,
  children,
}: {
  active: boolean;
  /** Turns the blocks off inside a loading area (notices that keep their text). */
  off?: boolean;
  children: ReactNode;
}) {
  const parent = use(SkeletonContext);
  return <SkeletonContext value={!off && (active || parent)}>{children}</SkeletonContext>;
}

/** True inside a loading container. */
export function useSkeleton(): boolean {
  return use(SkeletonContext);
}

/**
 * Text drawn as a block while loading: glyphs in the block color (Android draws nested
 * `transparent` text dark, so the glyphs take the block color instead).
 */
export const SKELETON_TEXT = {
  color: colors.skeleton.text,
  backgroundColor: colors.skeleton.text,
} as const;

/**
 * Hides content that has no text to turn into blocks (charts, photos, maps) and keeps its
 * size: an empty area with the container's loading color.
 */
export function SkeletonBlock({
  children,
  radius = 12,
  className,
}: {
  children: ReactNode;
  radius?: number;
  className?: string;
}) {
  const active = useSkeleton();
  if (!active) return <>{children}</>;
  return (
    <View
      className={cn('overflow-hidden', className)}
      style={{ borderRadius: radius, backgroundColor: colors.skeleton.surface }}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <View style={{ opacity: 0 }}>{children}</View>
    </View>
  );
}
