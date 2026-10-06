import { colors } from '@guara/ui-tokens';

import { useUserStore, type AvatarColor } from '@/stores/user';

import { Avatar } from './Avatar';

/** Disc colors of "Cor das iniciais" (all with dark initials, AA). */
export const AVATAR_COLORS: Record<AvatarColor, { color: string; label: string }> = {
  brand: { color: colors.brand.DEFAULT, label: 'amarelo' },
  positive: { color: colors.positive.DEFAULT, label: 'verde' },
  info: { color: colors.info.DEFAULT, label: 'azul' },
  negative: { color: colors.negative.DEFAULT, label: 'urucum' },
  sand: { color: colors.foreground.DEFAULT, label: 'areia' },
};

/** The signed-in user: photo, or the initials on the chosen color. */
export function UserAvatar({
  size = 40,
  decorative = true,
}: {
  size?: number;
  decorative?: boolean;
}) {
  const name = useUserStore((state) => state.name);
  const photoUri = useUserStore((state) => state.photoUri);
  const avatarColor = useUserStore((state) => state.avatarColor);
  return (
    <Avatar
      name={name}
      source={photoUri ? { uri: photoUri } : null}
      size={size}
      background={AVATAR_COLORS[avatarColor].color}
      decorative={decorative}
    />
  );
}
