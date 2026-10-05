import { colors } from '@guara/ui-tokens';
import { useEffect } from 'react';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

export interface LoadingRingProps {
  /** Diameter in dp (design: 72). */
  size?: number;
  /** Spoken while it turns ("Conectando o Itaú"). */
  accessibilityLabel?: string;
}

/** Sombra ring with a turning Tucano arc. Static when the system asks to reduce motion. */
export function LoadingRing({ size = 72, accessibilityLabel = 'Carregando' }: LoadingRingProps) {
  const rotation = useSharedValue(0);
  const stroke = size / 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    rotation.set(
      withRepeat(
        withTiming(360, {
          duration: 1100,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.System,
        }),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      ),
    );
  }, [rotation]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={[{ width: size, height: size }, style]}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.surface.muted}
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.brand.DEFAULT}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.37} ${circumference}`}
        />
      </Svg>
    </Animated.View>
  );
}
