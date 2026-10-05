import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { CardHeader } from '@/components/layout';
import { Card, LinkButton } from '@/components/ui';
import { BudgetProgressRow } from '@/features/budgets';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { BUDGETS } from '../data';

/** "Gastos por categoria": month spending against each cap. */
export function CategoryBudgetsCard() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  return (
    <Card padding={isTablet ? 'lg' : 'md'} className={cn('gap-3.5', isTablet && 'rounded-28')}>
      <CardHeader
        title="Gastos por categoria"
        size={isTablet ? 22 : 19}
        aside={<LinkButton label="Ajustar tetos" onPress={() => router.navigate('/new-budget')} />}
      />
      <View accessibilityLabel="Gasto do mês contra o teto de cada categoria" className="gap-1">
        {BUDGETS.map((budget) => (
          <BudgetProgressRow
            key={budget.category}
            {...budget}
            layout={isTablet ? 'inline' : 'stacked'}
          />
        ))}
      </View>
    </Card>
  );
}
