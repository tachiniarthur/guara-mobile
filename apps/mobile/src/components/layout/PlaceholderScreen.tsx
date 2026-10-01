import { Link } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { COMMON_COPY } from '@/constants/copy';

import { Screen } from './Screen';

interface PlaceholderScreenProps {
  /** Screen title in pt-BR. */
  title: string;
  /** Optional detail, e.g. the id of a dynamic route. */
  subtitle?: string | string[];
}

/** Temporary screen used by every route until the real UI is built. */
export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  const detail = Array.isArray(subtitle) ? subtitle.join('/') : subtitle;

  return (
    <Screen contentClassName="items-center justify-center gap-2">
      <Text variant="title" align="center" accessibilityRole="header">
        {title}
      </Text>
      {detail ? (
        <Text variant="body" tone="muted" align="center">
          {detail}
        </Text>
      ) : null}
      {__DEV__ ? (
        <Link href="/_sitemap" asChild>
          <Text variant="caption" tone="subtle" className="mt-6 underline">
            {COMMON_COPY.devRouteMap}
          </Text>
        </Link>
      ) : null}
    </Screen>
  );
}
