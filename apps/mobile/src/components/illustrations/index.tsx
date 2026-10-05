import { colors } from '@guara/ui-tokens';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, SvgXml } from 'react-native-svg';

import { cn } from '@/lib/cn';

import { CONTOURS_SVG } from './contours';

export * from './BrazilFlag';
export * from './MataSurface';
export * from './MataButton';

const MATA = require('@assets/images/textures/mata.jpg');

/**
 * Mata photo behind the onboarding header, darkening to the page background at the bottom
 * (design: 15% → 35% at 55% → solid).
 */
export function MataBackdrop({ className }: { className?: string }) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('absolute bottom-0 left-0 right-0 top-0', className)}
    >
      <Image
        source={MATA}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={{ top: '40%', left: '50%' }}
        accessible={false}
      />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id="mataFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.background.DEFAULT} stopOpacity={0.15} />
            <Stop offset="0.55" stopColor={colors.background.DEFAULT} stopOpacity={0.35} />
            <Stop offset="1" stopColor={colors.background.DEFAULT} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#mataFade)" />
      </Svg>
    </View>
  );
}

/** Contour lines (curvas de nível) behind the balance card — terrain, not decoration. */
export function Contours({ left = -24, top = -40 }: { left?: number; top?: number }) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: 'absolute', left, top }}
    >
      <SvgXml xml={CONTOURS_SVG} width={460} height={340} />
    </View>
  );
}
