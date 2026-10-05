import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

export interface InsightStat {
  label: string;
  value: ReactNode;
}

export interface InsightPanelProps {
  title: string;
  description: string;
  stats: InsightStat[];
  chart: ReactNode;
  legend: ReactNode;
  footnote: ReactNode;
}

/** Panel of "Como o saldo andou": title, key numbers, chart, legend and a reading of it. */
export function InsightPanel({
  title,
  description,
  stats,
  chart,
  legend,
  footnote,
}: InsightPanelProps) {
  return (
    <View className="min-w-0 gap-3.5 rounded-18 bg-surface-input p-4.5">
      <View className="gap-0.5">
        <Text size={16} weight="bold" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="caption" tone="subtle">
          {description}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-x-7 gap-y-2">
        {stats.map((stat) => (
          <View key={stat.label} className="min-w-0 gap-0.5">
            <Text variant="caption" tone="subtle">
              {stat.label}
            </Text>
            {stat.value}
          </View>
        ))}
      </View>
      {chart}
      <View className="flex-row flex-wrap gap-x-4.5 gap-y-2">{legend}</View>
      <Text variant="caption" tone="muted">
        {footnote}
      </Text>
    </View>
  );
}
