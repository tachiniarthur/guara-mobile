import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

import { GridCellReset, useFillsGridCell } from './ResponsiveGrid';

export interface SectionCardProps {
  title?: string;
  /** Caption under the title ("Gasto acumulado dia a dia"). */
  description?: string;
  /** Caption color (design: Seriema, or Névoa on the asset page). */
  descriptionTone?: 'subtle' | 'muted';
  /** Right side of the header (link, button, badge). */
  action?: ReactNode;
  /** Element before the title (icon tile, portrait). */
  leading?: ReactNode;
  /** Title size (design: 17 on list pages, 18 or 20). */
  titleSize?: 17 | 18 | 19 | 20;
  /** Padding in dp (design: 16, 18, 20 or 24). */
  padding?: 16 | 18 | 20 | 22 | 24;
  /** Gap between blocks (design: 4–20). */
  gap?: number;
  children: ReactNode;
  className?: string;
}

const PADDING = { 16: 'p-4', 18: 'p-4.5', 20: 'p-5', 22: 'p-[22px]', 24: 'p-6' } as const;

/** Card of a page section: Fraunces title + caption, optional action, then the content. */
export function SectionCard({
  title,
  description,
  descriptionTone = 'subtle',
  action,
  leading,
  titleSize = 20,
  padding = 20,
  gap = 14,
  children,
  className,
}: SectionCardProps) {
  const fill = useFillsGridCell();
  return (
    <View
      style={{ gap }}
      className={cn(
        'min-w-0 rounded-24 border border-border bg-surface',
        fill && 'flex-grow',
        PADDING[padding],
        className,
      )}
    >
      {title ? (
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-start gap-3">
            {leading}
            <View className="min-w-0 flex-1 gap-0.5">
              <Text
                serif
                weight="bold"
                size={titleSize}
                leading={1.25}
                tracking={titleSize === 20 ? -0.01 : 0}
                accessibilityRole="header"
              >
                {title}
              </Text>
              {description ? (
                <Text variant="caption" tone={descriptionTone}>
                  {description}
                </Text>
              ) : null}
            </View>
          </View>
          {action}
        </View>
      ) : null}
      <GridCellReset>{children}</GridCellReset>
    </View>
  );
}
