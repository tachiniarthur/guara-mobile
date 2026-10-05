import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

const WOLF = require('@assets/images/brand/wolf.png');

export interface LogoMarkProps {
  /** Disc diameter in dp (design: 44 header, 54 welcome, 56 rail). */
  size?: number;
  className?: string;
}

/** Maned wolf (lobo-guará) on the Mata disc, without border. */
export function LogoMark({ size = 44, className }: LogoMarkProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
      className={cn('overflow-hidden rounded-full bg-hero', className)}
    >
      <Image source={WOLF} style={{ width: size, height: size }} contentFit="cover" />
    </View>
  );
}

export interface AppLogoProps {
  size?: number;
  /** Wordmark size (Fraunces 800). */
  wordmarkSize?: number;
  /** White wordmark over the Mata header (welcome screen). */
  inverse?: boolean;
  className?: string;
}

/** Logo: the wolf always with the name "guará" beside it. */
export function AppLogo({
  size = 44,
  wordmarkSize = 26,
  inverse = false,
  className,
}: AppLogoProps) {
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel="Guará"
      className={cn('flex-row items-center gap-2.5', className)}
    >
      <LogoMark size={size} />
      <Text
        serif
        weight="extrabold"
        size={wordmarkSize}
        leading={1.1}
        tracking={-0.02}
        className={inverse ? 'text-hero-foreground' : undefined}
      >
        guará
      </Text>
    </View>
  );
}
