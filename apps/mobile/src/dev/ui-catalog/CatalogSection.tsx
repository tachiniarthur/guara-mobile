import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Divider, Text } from '@/components/ui';

/** Catalog block: component name, short note and the examples. */
export function CatalogSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <Divider />
      <View className="gap-1 pt-2">
        <Text variant="subtitle" accessibilityRole="header">
          {title}
        </Text>
        {note ? (
          <Text variant="caption" tone="subtle">
            {note}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** Small caption above an example ("desabilitado", "carregando"…). */
export function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
      {children}
    </View>
  );
}
