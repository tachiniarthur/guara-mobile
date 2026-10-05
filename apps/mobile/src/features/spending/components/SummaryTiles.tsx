import type { TransactionSummary } from '@guara/types';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { MoneyText, Text } from '@/components/ui';

export interface SummaryTilesProps {
  /** `null` when the figures of the current filter are unknown ("—"). */
  summary: TransactionSummary | null;
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5">
      <Text size={13} tone="subtle">
        {label}
      </Text>
      {children}
    </View>
  );
}

/** "Entrou" and "Saiu" of the listed period. */
export function SummaryTiles({ summary }: SummaryTilesProps) {
  return (
    <View className="flex-row gap-2.5">
      <Tile label="Entrou">
        <MoneyText
          value={summary?.totalIn ?? null}
          serif
          weight="bold"
          size={17}
          tone={summary ? 'positive' : 'default'}
        />
      </Tile>
      <Tile label="Saiu">
        <MoneyText value={summary?.totalOut ?? null} serif weight="bold" size={17} />
      </Tile>
    </View>
  );
}
