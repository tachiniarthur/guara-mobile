import type { UseQueryResult } from '@tanstack/react-query';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { COMMON_COPY, FEEDBACK_COPY } from '@/constants/copy';

import { Screen } from './Screen';

interface PlaceholderScreenProps {
  /** Screen title in pt-BR. */
  title: string;
  /** Optional detail, e.g. the id of a dynamic route. */
  subtitle?: string | string[];
  /** Temporary data summary proving the screen is wired to its hooks. */
  children?: ReactNode;
}

/** Temporary screen used by every route until the real UI is built. */
export function PlaceholderScreen({ title, subtitle, children }: PlaceholderScreenProps) {
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
      {children}
      {__DEV__ ? (
        <View className="mt-6 flex-row flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/_sitemap" asChild>
            <Text variant="caption" tone="subtle" className="underline">
              {COMMON_COPY.devRouteMap}
            </Text>
          </Link>
          <Link href="/ui" asChild>
            <Text variant="caption" tone="subtle" className="underline">
              {COMMON_COPY.devUiCatalog}
            </Text>
          </Link>
        </View>
      ) : null}
    </Screen>
  );
}

interface PlaceholderSummaryProps<T> {
  query: Pick<UseQueryResult<T>, 'data' | 'error' | 'isPending'>;
  children: (data: T) => ReactNode;
}

/** Loading / error / data line used by placeholders wired to real hooks. */
export function PlaceholderSummary<T>({ query, children }: PlaceholderSummaryProps<T>) {
  if (query.isPending) {
    return (
      <Text variant="body" tone="muted" align="center">
        {FEEDBACK_COPY.loading}…
      </Text>
    );
  }
  if (query.error || query.data === undefined) {
    return (
      <Text variant="body" tone="negative" align="center">
        {query.error?.message ?? FEEDBACK_COPY.errorTitle}
      </Text>
    );
  }
  return <View className="items-center gap-1">{children(query.data)}</View>;
}
