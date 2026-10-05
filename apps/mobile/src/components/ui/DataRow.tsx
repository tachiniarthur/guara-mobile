import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { InfoTip } from './InfoTip';
import { Text, type TextTone } from './Text';

export interface DataRowProps {
  label: string;
  /** Text value (bold, tabular) or a custom node (pill, link). */
  value: ReactNode;
  /** (i) after the value. */
  info?: string;
  /** (i) after the label (indicators). */
  labelInfo?: string;
  tone?: TextTone;
  /** `stacked`: label above the value (long names). */
  layout?: 'inline' | 'stacked';
  /**
   * Row height: `compact` (min 40, baseline aligned), `regular` (10 vertical padding) or
   * `relaxed` (12 vertical padding).
   */
  density?: 'compact' | 'regular' | 'relaxed';
  /** Value size (design: 15, or 16 for indicators). */
  valueSize?: 15 | 16;
  labelTone?: 'muted' | 'soft';
  /** Hides the bottom divider. */
  last?: boolean;
}

const DENSITY = { compact: 'min-h-10', regular: 'py-2.5', relaxed: 'py-3' } as const;

/** Label/value line of a definition list (`dl`) with the Musgo divider. */
export function DataRow({
  label,
  value,
  info,
  labelInfo,
  tone = 'default',
  layout = 'inline',
  density = 'regular',
  valueSize = 15,
  labelTone = 'muted',
  last = false,
}: DataRowProps) {
  const valueNode =
    typeof value === 'string' ? (
      <Text
        size={valueSize}
        weight="bold"
        tone={tone}
        tabular
        align={layout === 'inline' ? 'right' : 'left'}
      >
        {value}
      </Text>
    ) : (
      value
    );

  return (
    <View
      className={cn(
        DENSITY[density],
        !last && 'border-b border-border',
        layout === 'stacked' ? 'gap-0.5' : 'flex-row items-center justify-between gap-3',
      )}
    >
      <View className={cn('flex-row items-center', layout === 'inline' && 'shrink')}>
        <Text size={14} tone={labelTone}>
          {label}
        </Text>
        {labelInfo ? <InfoTip text={labelInfo} size={14} /> : null}
      </View>
      <View
        className={cn('flex-row items-center', layout === 'inline' && 'min-w-0 shrink justify-end')}
      >
        {valueNode}
        {info ? <InfoTip text={info} /> : null}
      </View>
    </View>
  );
}
