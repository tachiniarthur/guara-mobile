import { duration } from '@guara/ui-tokens';
import { useEffect } from 'react';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';

export interface SkeletonProps {
  /** Size and shape via classes, e.g. "h-4 w-24" or "h-10 w-10 rounded-full". */
  className?: string;
}

/**
 * Loading placeholder with a soft pulse. `ReduceMotion.System` keeps it static when the
 * system asks to reduce motion. Hidden from screen readers — announce loading once on the
 * container instead.
 */
export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.45, { duration: duration.pulse, reduceMotion: ReduceMotion.System }),
      -1,
      true,
      undefined,
      ReduceMotion.System,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className={cn('h-4 rounded-md bg-skeleton', className)}
      style={animatedStyle}
    />
  );
}
