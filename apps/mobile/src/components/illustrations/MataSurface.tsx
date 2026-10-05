import { colors } from '@guara/ui-tokens';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const MATA = require('@assets/images/textures/mata.jpg');

export interface MataSurfaceProps extends ViewProps {
  children: ReactNode;
  /**
   * Opacity of the dark veil from left to right, so text on the left stays legible
   * (design: 0.78 → 0.45 → 0.15 on buttons, 0.85 → 0.55 → 0.1 on the profile card).
   */
  veil?: readonly [number, number, number];
  className?: string;
}

/** Mata texture with a dark gradient (only on a few highlights of the interface). */
export function MataSurface({
  children,
  veil = [0.78, 0.45, 0.15],
  className,
  style,
  ...props
}: MataSurfaceProps) {
  return (
    <View
      className={className}
      style={[{ overflow: 'hidden', backgroundColor: colors.hero.DEFAULT }, style]}
      {...props}
    >
      <Image
        source={MATA}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="right center"
        accessible={false}
      />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.background.DEFAULT} stopOpacity={veil[0]} />
            <Stop offset="0.6" stopColor={colors.background.DEFAULT} stopOpacity={veil[1]} />
            <Stop offset="1" stopColor={colors.background.DEFAULT} stopOpacity={veil[2]} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#veil)" />
      </Svg>
      {children}
    </View>
  );
}
