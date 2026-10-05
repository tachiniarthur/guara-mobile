import { View } from 'react-native';

import { ResponsiveGrid, SectionCard } from '@/components/layout';
import { MoneyText, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { REPORT, SPLIT } from '../data';

function Total({
  label,
  value,
  tone,
  caption,
}: {
  label: string;
  value: typeof REPORT.totals.in;
  tone: 'info' | 'default' | 'positive';
  caption?: string;
}) {
  return (
    <View className="min-w-0 gap-0.5">
      <Text size={13} tone="muted">
        {label}
      </Text>
      <MoneyText
        value={value}
        serif
        weight="extrabold"
        size={22}
        leading={1.15}
        tracking={-0.01}
        tone={tone}
        numberOfLines={1}
      />
      {caption ? (
        <Text size={13} tone="subtle">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/** Totals of the period + where the money went (stacked bar and legend). */
export function ReportSummaryCard() {
  const { isTablet } = useBreakpoint();
  const columns = { phone: 2, tablet: 3 };
  return (
    <SectionCard gap={16}>
      <ResponsiveGrid columns={columns} stretch={false}>
        <Total label="Entrou" value={REPORT.totals.in} tone="info" />
        <Total label="Saiu" value={REPORT.totals.out} tone="default" />
        <Total
          label="Sobrou"
          value={REPORT.totals.left}
          tone="positive"
          caption={REPORT.totals.leftShare}
        />
      </ResponsiveGrid>
      <View
        accessibilityElementsHidden
        className="h-3.5 flex-row gap-[3px] overflow-hidden rounded-[7px]"
      >
        {SPLIT.map((item) => (
          <View
            key={item.label}
            style={{ flexGrow: item.weight, flexBasis: 0, backgroundColor: item.color }}
          />
        ))}
      </View>
      <ResponsiveGrid columns={columns} gap={isTablet ? 16 : 8} stretch={false}>
        {SPLIT.map((item) => (
          <View key={item.label} className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
            <Text size={13} tone="muted" className="flex-1">
              {item.label}
            </Text>
            <Text size={13} weight="bold" tabular>
              {item.share}%
            </Text>
          </View>
        ))}
      </ResponsiveGrid>
    </SectionCard>
  );
}
