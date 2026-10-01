import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { COMMON_COPY } from '@/constants/copy';

import { ResponsiveContainer } from './ResponsiveContainer';

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
    <View className="flex-1 bg-background">
      <ResponsiveContainer className="flex-1 items-center justify-center px-6">
        <Text
          accessibilityRole="header"
          className="text-center text-2xl font-semibold text-foreground"
        >
          {title}
        </Text>
        {detail ? (
          <Text className="mt-2 text-center text-base text-foreground-muted">{detail}</Text>
        ) : null}
        {__DEV__ ? (
          <Link href="/_sitemap" asChild>
            <Text className="mt-8 text-sm text-foreground-subtle underline">
              {COMMON_COPY.devRouteMap}
            </Text>
          </Link>
        ) : null}
      </ResponsiveContainer>
    </View>
  );
}
