import type { AssistantId } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ASSISTANTS } from '../assistants';

import { RING_PATHS } from './ring-paths';

export interface RingedPortraitProps {
  assistant: AssistantId;
  /** Diameter in dp (design: 44). */
  size?: number;
}

/** Portrait on a biome disc with a hand-drawn double ring (lists of the team's notices). */
export function RingedPortrait({ assistant, size = 44 }: RingedPortraitProps) {
  const meta = ASSISTANTS[assistant];
  const inner = size * 0.88;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx={50} cy={50} r={49} fill={meta.ringColor} />
        {RING_PATHS.map((d) => (
          <Path
            key={d.slice(0, 24)}
            d={d}
            fill="none"
            stroke={colors.foreground.DEFAULT}
            strokeWidth={0.6}
            opacity={0.9}
          />
        ))}
      </Svg>
      <Image
        source={meta.avatar}
        style={{
          position: 'absolute',
          left: size * 0.06,
          top: size * 0.06,
          width: inner,
          height: inner,
          borderRadius: inner / 2,
        }}
        contentFit="cover"
      />
    </View>
  );
}
