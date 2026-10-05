import type { AssistantId } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { ASSISTANTS } from '../assistants';

export interface AssistantAvatarProps {
  assistant: AssistantId;
  /** Outer diameter in dp (design: 32, 40, 46). */
  size?: number;
  /** Ring thickness (design: 2 up to 40, 3 above). */
  ring?: number;
  /** Small Urucum dot on the top-right corner (something new from this assistant). */
  alert?: boolean;
}

/**
 * Portrait inside a ring in the color of its biome, with a thin Areia inner line.
 * Decorative: the assistant's name is always written next to it.
 */
export function AssistantAvatar({
  assistant,
  size = 40,
  ring,
  alert = false,
}: AssistantAvatarProps) {
  const meta = ASSISTANTS[assistant];
  const padding = ring ?? (size > 40 ? 3 : 2);
  const inner = size - padding * 2;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        padding,
        borderRadius: size / 2,
        backgroundColor: meta.ringColor,
        // CSS `box-shadow: inset 0 0 0 1px` → a 1px border inside the ring.
        borderWidth: 1,
        borderColor: colors.avatarRing,
      }}
    >
      <Image
        source={meta.avatar}
        style={{ width: inner - 2, height: inner - 2, borderRadius: inner / 2 }}
        contentFit="cover"
      />
      {alert ? (
        <View
          className="absolute h-[11px] w-[11px] rounded-full border-2 border-background bg-negative"
          style={{ right: -1, top: -1 }}
        />
      ) : null}
    </View>
  );
}
