import type { Breakpoint } from '@guara/ui-tokens';
import { Children, createContext, useContext, type ReactNode } from 'react';
import { View } from 'react-native';

import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface ResponsiveGridProps {
  children: ReactNode;
  /**
   * Columns per breakpoint (default: 1 on phones, 2 on tablets). Large tablets use the tablet
   * value unless `desktop` is given: the layouts are designed for phone and tablet only.
   */
  columns?: Partial<Record<Breakpoint, number>>;
  /** Space between cells in dp (default 16). */
  gap?: number;
  /** Stretch the cells of a row to the same height (default true). */
  stretch?: boolean;
  className?: string;
}

const DEFAULT_COLUMNS = { phone: 1, tablet: 2 } as const;

/**
 * Whether the content sits directly in a stretched grid cell: cards (`SectionCard`) then grow
 * to the height of the row ("cards da mesma linha terminam na mesma altura").
 */
const GridCellContext = createContext(false);

/** Cards call this to fill a stretched grid cell; their own content resets it. */
export function useFillsGridCell(): boolean {
  return useContext(GridCellContext);
}

/** Makes the card inside fill the rest of a column that is stretched to the row's height. */
export function FillColumn({ children }: { children: ReactNode }) {
  return <GridCellContext.Provider value>{children}</GridCellContext.Provider>;
}

export function GridCellReset({ children }: { children: ReactNode }) {
  return <GridCellContext.Provider value={false}>{children}</GridCellContext.Provider>;
}

/** Lays out children in equal columns that adapt to phone/tablet (CSS grid of the design). */
export function ResponsiveGrid({
  children,
  columns,
  gap = 16,
  stretch = true,
  className,
}: ResponsiveGridProps) {
  const { breakpoint } = useBreakpoint();
  const phone = columns?.phone ?? DEFAULT_COLUMNS.phone;
  const tablet = columns?.tablet ?? DEFAULT_COLUMNS.tablet;
  const perBreakpoint: Record<Breakpoint, number> = {
    phone,
    tablet,
    desktop: columns?.desktop ?? tablet,
  };
  const count = Math.max(1, perBreakpoint[breakpoint]);
  const items = Children.toArray(children);

  const rows: ReactNode[][] = [];
  for (let index = 0; index < items.length; index += count) {
    rows.push(items.slice(index, index + count));
  }

  return (
    <View style={{ gap }} className={className}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{ gap, alignItems: stretch ? 'stretch' : 'flex-start' }}
          className="flex-row"
        >
          {row.map((item, index) => (
            <View key={index} className="min-w-0 flex-1">
              <GridCellContext.Provider value={stretch && count > 1}>
                {item}
              </GridCellContext.Provider>
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
