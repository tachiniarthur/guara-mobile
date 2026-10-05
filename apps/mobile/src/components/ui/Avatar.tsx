import { Image, type ImageSource } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface AvatarProps {
  /** Name used for the initials fallback and for screen readers. */
  name: string;
  source?: ImageSource | number | null;
  /** Diameter in dp (default 40). */
  size?: number;
  /**
   * - `brand`: Tucano disc with dark initials (the user, "AR").
   * - `neutral`: Sombra disc (merchants, banks).
   */
  tone?: 'brand' | 'neutral';
  /** Hide from screen readers when the name is already written next to it. */
  decorative?: boolean;
  className?: string;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase();
  const letters = [words[0], words[words.length - 1]];
  return letters
    .map((word) => word?.[0] ?? '')
    .join('')
    .toUpperCase();
}

/** Round image with an initials fallback (Fraunces 800). */
export function Avatar({
  name,
  source,
  size = 40,
  tone = 'brand',
  decorative = false,
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = source != null && !failed;

  return (
    <View
      accessible={!decorative}
      accessibilityRole="image"
      accessibilityLabel={decorative ? undefined : name}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      style={{ width: size, height: size }}
      className={cn(
        'items-center justify-center overflow-hidden rounded-full',
        tone === 'brand' ? 'bg-brand' : 'bg-surface-muted',
        className,
      )}
    >
      {showImage ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text
          serif
          weight="extrabold"
          size={Math.round(size * 0.38)}
          leading={1}
          tone={tone === 'brand' ? 'inverse' : 'default'}
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
