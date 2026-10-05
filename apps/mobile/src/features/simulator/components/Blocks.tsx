import type { ReactNode } from 'react';
import { View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { Icon, Text, type IconName, type TextTone } from '@/components/ui';
import { cn } from '@/lib/cn';

/** Card of the simulator's secondary blocks (18 Fraunces title + caption). */
export function SimCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  /** Right of the title (link to the full list). */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SectionCard
      title={title}
      description={description}
      action={action}
      titleSize={18}
      gap={16}
      className="flex-1"
    >
      {children}
    </SectionCard>
  );
}

export interface FigureRowItem {
  key: string;
  title: string;
  caption?: string | null;
  value: string;
  tone?: TextTone;
}

/** Title + caption on the left, a figure on the right ("E se…", "Cabe no seu orçamento?"). */
export function FigureRows({ items }: { items: readonly FigureRowItem[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <View
          key={item.key}
          className={cn(
            'flex-row items-center justify-between gap-3 py-[11px]',
            index < items.length - 1 && 'border-b border-border',
          )}
        >
          <View className="min-w-0 flex-1">
            <Text size={14} weight="semibold" leading={1.35}>
              {item.title}
            </Text>
            {item.caption ? (
              <Text size={12} tone="subtle" leading={1.35}>
                {item.caption}
              </Text>
            ) : null}
          </View>
          <Text size={15} weight="bold" tone={item.tone ?? 'default'} tabular align="right">
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Tinted note with an icon and a sentence with bold figures. */
export function Insight({
  icon,
  color,
  children,
}: {
  icon: IconName;
  color: string;
  children: ReactNode;
}) {
  return (
    <View className="flex-row gap-2.5 rounded-16 bg-surface-input px-4 py-3.5">
      <View style={{ marginTop: 2 }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text size={14} leading={1.55} className="flex-1">
        {children}
      </Text>
    </View>
  );
}

export interface Milestone {
  key: string;
  date: string;
  title: string;
  caption: string;
  /** Filled dot (the step that happens now). */
  filled?: boolean;
}

/** Vertical path of milestones with dates on the left ("Marcos do caminho"). */
export function MilestoneList({
  items,
  color,
  dateWidth = 64,
}: {
  items: readonly Milestone[];
  color: string;
  dateWidth?: 64 | 84;
}) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={item.key} className="flex-row items-start gap-2.5">
          <Text
            size={13}
            weight="bold"
            tone="muted"
            tabular
            style={{ width: dateWidth, paddingTop: 1 }}
          >
            {item.date}
          </Text>
          <View className="w-5 items-center self-stretch" style={{ minHeight: 44 }}>
            <View
              className="mt-1 h-3 w-3 rounded-full border-2 bg-surface"
              style={{ borderColor: color, backgroundColor: item.filled ? color : undefined }}
            />
            {index < items.length - 1 ? (
              <View className="absolute w-0.5 bg-border" style={{ top: 16, bottom: -6 }} />
            ) : null}
          </View>
          <View className="min-w-0 flex-1 pb-2.5">
            <Text size={15} weight="bold" tabular leading={1.35}>
              {item.title}
            </Text>
            <Text size={12} tone="subtle" leading={1.35}>
              {item.caption}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export interface Part {
  label: string;
  value: number;
  /** Formatted amount ("R$ 1,74 mi"). */
  display: string;
  color: string;
}

/** Stacked bar and legend of where the money comes from. */
export function Composition({ parts }: { parts: readonly Part[] }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  return (
    <>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Composição: ${parts.map((part) => `${part.label} ${Math.round((part.value / total) * 100)}%`).join(', ')}`}
        className="h-4 flex-row gap-0.5 overflow-hidden rounded-full"
      >
        {parts.map((part) => (
          <View
            key={part.label}
            style={{ width: `${(part.value / total) * 100}%`, backgroundColor: part.color }}
          />
        ))}
      </View>
      <View>
        {parts.map((part) => (
          <View key={part.label} className="flex-row items-center justify-between gap-2.5 py-2">
            <View className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: part.color }} />
              <Text size={14}>{part.label}</Text>
            </View>
            <Text size={14} weight="bold" tabular>
              {part.display}
              <Text size={14} tone="subtle">
                {` · ${Math.round((part.value / total) * 100)}%`}
              </Text>
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}
