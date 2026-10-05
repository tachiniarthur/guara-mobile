import { View } from 'react-native';

import { cn } from '@/lib/cn';

import type { BadgeTone } from '../lib/goals';

const FILL: Record<BadgeTone, string> = {
  positive: 'bg-positive',
  info: 'bg-info',
  warning: 'bg-warning',
  negative: 'bg-negative',
  neutral: 'bg-foreground-subtle',
};

export interface GoalBarProps {
  percent: number;
  tone: BadgeTone;
  /** 10 on cards, 12 on the goal page. */
  height?: 10 | 12;
  /** Milestones (percent) drawn as Areia ticks; `reached` ones are solid. */
  marks?: { percent: number; reached: boolean }[];
  /** Track over the Mata texture (darker and translucent). */
  onMata?: boolean;
}

/** Progress of a goal (an empty goal still shows a 1% sliver, like the design). */
export function GoalBar({ percent, tone, height = 10, marks = [], onMata = false }: GoalBarProps) {
  const width = Math.max(1, Math.min(100, percent));
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height, borderRadius: height / 2 }}
      className={onMata ? 'bg-scrim-strong' : 'bg-surface-muted'}
    >
      <View
        className={cn('absolute left-0 top-0', FILL[tone])}
        style={{ height, width: `${width}%`, borderRadius: height / 2 }}
      />
      {marks.map((mark) => (
        <View
          key={mark.percent}
          className={cn(
            'absolute w-0.5 rounded-[1px] bg-foreground',
            !mark.reached && 'opacity-50',
          )}
          style={{ left: `${mark.percent}%`, marginLeft: -1, top: -3, height: height + 6 }}
        />
      ))}
    </View>
  );
}
