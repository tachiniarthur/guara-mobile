import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, SvgXml } from 'react-native-svg';

import { cn } from '@/lib/cn';

import { CONTOURS_SVG } from './contours';
import { JUNGLE_SVG } from './jungle';

export * from './BrazilFlag';
export * from './MataSurface';
export * from './MataButton';

export interface JungleBackdropProps {
  /** Height of the fade from the Mata color at the top (design: 110). */
  fadeHeight?: number;
  className?: string;
}

/**
 * Foliage and flowers anchored to the bottom of a Mata header. The design fades it in from the
 * top with a CSS mask; here a gradient in the header color covers the top instead.
 */
export function JungleBackdrop({ fadeHeight = 110, className }: JungleBackdropProps) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('absolute bottom-0 left-0 right-0 top-0', className)}
    >
      <SvgXml xml={JUNGLE_SVG} width="100%" height="100%" />
      <Svg width="100%" height={fadeHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.hero.DEFAULT} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.hero.DEFAULT} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#fade)" />
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
