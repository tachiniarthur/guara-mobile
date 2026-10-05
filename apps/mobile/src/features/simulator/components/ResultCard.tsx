import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

export interface Scenario {
  key: string;
  label: string;
  caption: string;
  value: string;
  selected: boolean;
  onPress: () => void;
}

export interface ResultCardProps {
  title: string;
  subtitle: string;
  /** "Aporte mensal necessário". */
  label: string;
  /** Headline amount ("R$ 5.640"). */
  value: string;
  /** Line under the amount (rich text). */
  caption: ReactNode;
  chart: ReactNode;
  legend: ReactNode;
  scenarios: readonly Scenario[];
  actions: ReactNode;
  footnote: string;
  wide?: boolean;
}

/** Main result of a simulation: monthly amount, chart, three scenarios and the actions. */
export function ResultCard({
  title,
  subtitle,
  label,
  value,
  caption,
  chart,
  legend,
  scenarios,
  actions,
  footnote,
  wide = false,
}: ResultCardProps) {
  return (
    <SectionCard title={title} description={subtitle} gap={16}>
      <View className="gap-1">
        <Text size={14} tone="muted">
          {label}
        </Text>
        <View className="flex-row items-baseline gap-1.5" accessibilityLiveRegion="polite">
          <Text
            serif
            weight="extrabold"
            size={wide ? 44 : 38}
            leading={1.05}
            tracking={-0.02}
            tabular
          >
            {value}
          </Text>
          <Text size={15} tone="muted">
            /mês
          </Text>
        </View>
        {caption}
      </View>
      {chart}
      {legend}
      <View accessibilityRole="radiogroup" accessibilityLabel="Cenários" className="flex-row gap-2">
        {scenarios.map((scenario) => (
          <Pressable
            key={scenario.key}
            accessibilityRole="radio"
            accessibilityState={{ checked: scenario.selected }}
            accessibilityLabel={`${scenario.label}, ${scenario.caption}: ${scenario.value}`}
            onPress={() => {
              haptics.selection();
              scenario.onPress();
            }}
            className={cn(
              'min-w-0 flex-1 gap-0.5 rounded-16 px-3.5 py-3 active:bg-surface-pressed',
              scenario.selected ? 'border-2 border-foreground' : 'border border-border',
            )}
          >
            <Text
              size={13}
              weight="bold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {scenario.label}
            </Text>
            <Text size={12} tone="subtle">
              {scenario.caption}
            </Text>
            <Text serif weight="bold" size={18} tabular numberOfLines={1} adjustsFontSizeToFit>
              {scenario.value}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row flex-wrap gap-2">{actions}</View>
      <Text size={12} tone="subtle">
        {footnote}
      </Text>
    </SectionCard>
  );
}
