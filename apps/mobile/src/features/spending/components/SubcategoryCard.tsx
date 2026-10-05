import type { CategoryMonthSummary } from '@guara/types';
import { View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { MoneyText, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { SUBCATEGORY_LABELS } from '../categories';

/** "Onde foi": spending of each subcategory with its share of the category. */
export function SubcategoryCard({ items }: { items: CategoryMonthSummary['subcategories'] }) {
  return (
    <SectionCard title="Onde foi" titleSize={17} padding={18}>
      <View>
        {items.map((item, index) => (
          <View
            key={item.subcategoryId}
            accessible
            accessibilityLabel={`${SUBCATEGORY_LABELS[item.subcategoryId]}: ${item.count} lançamentos, ${Math.round(item.share)}%`}
            className={cn(
              'flex-row items-center gap-3 py-3',
              index < items.length - 1 && 'border-b border-border',
            )}
          >
            <View className="min-w-0 flex-1">
              <Text weight="medium" leading={1.35}>
                {SUBCATEGORY_LABELS[item.subcategoryId]}
              </Text>
              <Text size={12} tone="subtle" leading={1.35}>
                {item.count} {item.count === 1 ? 'lançamento' : 'lançamentos'}
              </Text>
            </View>
            <View className="items-end">
              <MoneyText value={item.spent} weight="bold" leading={1.35} />
              <Text size={12} tone="subtle" leading={1.35} tabular>
                {Math.round(item.share)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}
