import { useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  /** Share of the free width (default 1). */
  flex?: number;
  /** Header only for screen readers (the design hides "Indicador"). */
  hideLabel?: boolean;
}

export interface DataTableRow {
  key: string;
  /** One node per column (use `Text` with the design's size and tone). */
  cells: ReactNode[];
}

export interface DataTableProps {
  /** Name read by screen readers (the table's `caption`). */
  caption: string;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
  /** Horizontal cell padding (design: 10 in dense tables, 16 otherwise). */
  cellPadding?: 10 | 16;
  /** Below this width the table scrolls sideways instead of squeezing the columns. */
  minWidth?: number;
  /** Row under the table ("Ver todos (64)"). */
  footer?: ReactNode;
}

/** Bordered table of the tablet layouts: Input-colored header in caps, Musgo row dividers. */
export function DataTable({
  caption,
  columns,
  rows,
  cellPadding = 16,
  minWidth = 0,
  footer,
}: DataTableProps) {
  const cellClass = cellPadding === 10 ? 'px-2.5 py-3' : 'px-4 py-3';
  const [available, setAvailable] = useState(0);
  // Fixed widths keep every row aligned (Yoga lets a wide cell push its neighbours).
  const width = Math.max(available, minWidth);
  const totalFlex = columns.reduce((sum, column) => sum + (column.flex ?? 1), 0);
  const widthOf = (column: DataTableColumn | undefined) =>
    (width * (column?.flex ?? 1)) / totalFlex;

  return (
    <View
      accessibilityLabel={caption}
      onLayout={(event) => setAvailable(event.nativeEvent.layout.width - 2)}
      className="overflow-hidden rounded-16 border border-border"
    >
      {/* Rows wait for the first measure: at width 0 every cell would wrap letter by letter. */}
      {width > 0 ? (
        <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
          <View style={{ width }}>
            <View className="flex-row border-b border-border-strong bg-surface-input">
              {columns.map((column) => (
                <View key={column.key} style={{ width: widthOf(column) }} className={cellClass}>
                  <Text
                    size={12}
                    weight="bold"
                    tracking={0.04}
                    tone="muted"
                    numberOfLines={1}
                    align={column.align ?? 'left'}
                    accessibilityLabel={column.label}
                    style={column.hideLabel ? { opacity: 0 } : undefined}
                  >
                    {column.label.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
            {rows.map((row, rowIndex) => (
              <View
                key={row.key}
                className={cn(
                  'flex-row items-center',
                  rowIndex < rows.length - 1 && 'border-b border-border',
                )}
              >
                {row.cells.map((cell, index) => {
                  const column = columns[index];
                  return (
                    <View
                      key={column?.key ?? index}
                      style={{ width: widthOf(column) }}
                      className={cn(
                        cellClass,
                        'flex-row items-center',
                        column?.align === 'right' && 'justify-end',
                      )}
                    >
                      {cell}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
      {footer ? <View className="border-t border-border">{footer}</View> : null}
    </View>
  );
}
