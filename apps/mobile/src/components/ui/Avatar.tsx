import { avatarSize, type AvatarSize } from '@guara/ui-tokens';
import { Image, type ImageSource } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface AvatarProps {
  /** Name used for the initials fallback and for screen readers. */
  name: string;
  source?: ImageSource | number | null;
  size?: AvatarSize;
  className?: string;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : [words[0]];
  return letters
    .map((word) => word?.[0] ?? '')
    .join('')
    .toUpperCase();
}

/** Round image with an initials fallback (banks, assistants, user). */
export function Avatar({ name, source, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const diameter = avatarSize[size];
  const showImage = source != null && !failed;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={{ width: diameter, height: diameter }}
      className={cn(
        'items-center justify-center overflow-hidden rounded-full bg-surface-muted',
        className,
      )}
    >
      {showImage ? (
        <Image
          source={source}
          style={{ width: diameter, height: diameter }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text variant={size === 'lg' ? 'subtitle' : 'label'} tone="muted">
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
