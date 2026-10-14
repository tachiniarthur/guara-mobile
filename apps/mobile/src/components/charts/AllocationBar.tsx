import { View } from 'react-native';

import { SkeletonBlock } from '@/components/ui/SkeletonScope';

export interface AllocationSegment {
  label: string;
  /** Share in percent (the segments should add up to 100). */
  percent: number;
  color: string;
}

export interface AllocationBarProps {
  segments: readonly AllocationSegment[];
  /** Height in dp (design: 8 on cards, 12–14 on Investimentos). */
  height?: number;
  /** Gap between segments (design: 2). */
  gap?: number;
  accessibilityLabel?: string;
}

/** Stacked horizontal bar of a portfolio allocation. */
function AllocationBarDrawing({
  segments,
  height = 8,
  gap = 2,
  accessibilityLabel,
}: AllocationBarProps) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        accessibilityLabel ??
        `Alocação: ${segments.map((segment) => `${segment.label} ${segment.percent}%`).join(', ')}`
      }
      style={{ height, gap, borderRadius: height / 2 }}
      className="flex-row overflow-hidden"
    >
      {segments.map((segment) => (
        <View
          key={segment.label}
          style={{ flexGrow: segment.percent, flexBasis: 0, backgroundColor: segment.color }}
        />
      ))}
    </View>
  );
}

/** AllocationBar as a flat area while loading (`SkeletonBlock`). */
export function AllocationBar(props: AllocationBarProps) {
  return (
    <SkeletonBlock>
      <AllocationBarDrawing {...props} />
    </SkeletonBlock>
  );
}
