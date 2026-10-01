import type { Breakpoint } from '@guara/ui-tokens';
import { Children, type ReactNode } from 'react';
import { View } from 'react-native';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

export interface ResponsiveGridProps {
  children: ReactNode;
  /** Columns per breakpoint (default: 1 on phones, 2 on tablets, 3 on large tablets). */
  columns?: Partial<Record<Breakpoint, number>>;
  className?: string;
}

const DEFAULT_COLUMNS: Record<Breakpoint, number> = { phone: 1, tablet: 2, desktop: 3 };

/** Lays out children in equal columns that adapt to phone/tablet. */
export function ResponsiveGrid({ children, columns, className }: ResponsiveGridProps) {
  const { breakpoint } = useBreakpoint();
  const count = Math.max(1, { ...DEFAULT_COLUMNS, ...columns }[breakpoint]);
  const items = Children.toArray(children);

  const rows: ReactNode[][] = [];
  for (let index = 0; index < items.length; index += count) {
    rows.push(items.slice(index, index + count));
  }

  return (
    <View className={cn('gap-4', className)}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-4">
          {row.map((item, index) => (
            <View key={index} className="flex-1">
              {item}
            </View>
          ))}
          {/* Keep cell widths equal on an incomplete last row. */}
          {Array.from({ length: count - row.length }, (_, index) => (
            <View key={`spacer-${index}`} className="flex-1" />
          ))}
        </View>
      ))}
    </View>
  );
}
