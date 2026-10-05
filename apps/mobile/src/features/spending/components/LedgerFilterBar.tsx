import type { CategoryId, YearMonth } from '@guara/types';
import { useState } from 'react';
import { View } from 'react-native';

import { OptionSheet, SearchInput, SelectPill } from '@/components/ui';

import { CATEGORY_LABELS } from '../categories';
import type { DirectionFilter, LedgerFilters } from '../lib/ledger';
import { monthLabel, monthPillLabel } from '../lib/format';

import { BankFilter } from './BankFilter';

const DIRECTIONS: { value: DirectionFilter; label: string }[] = [
  { value: 'all', label: 'Saídas e entradas' },
  { value: 'out', label: 'Só saídas' },
  { value: 'in', label: 'Só entradas' },
];

export interface LedgerFilterBarProps {
  filters: LedgerFilters;
  onChange: (filters: LedgerFilters) => void;
  /** Months with transactions (newest first). */
  months: readonly YearMonth[];
  /** Categories present in the month. */
  categories: readonly CategoryId[];
  /** Tablet: chips wrap instead of scrolling. */
  wrap?: boolean;
}

type OpenSheet = 'month' | 'category' | 'direction' | null;

/** Search, bank chips and the month / category / direction pickers of "Todos os lançamentos". */
export function LedgerFilterBar({
  filters,
  onChange,
  months,
  categories,
  wrap = false,
}: LedgerFilterBarProps) {
  const [open, setOpen] = useState<OpenSheet>(null);
  const update = (patch: Partial<LedgerFilters>) => onChange({ ...filters, ...patch });
  const close = () => setOpen(null);
  const categoryText =
    filters.categoryId === 'all' ? 'Categorias' : CATEGORY_LABELS[filters.categoryId];
  const directionText =
    DIRECTIONS.find((item) => item.value === filters.direction)?.label ?? DIRECTIONS[0]!.label;

  return (
    <View className="gap-3.5">
      <SearchInput
        size={46}
        value={filters.query}
        onChangeText={(query) => update({ query })}
        placeholder="Buscar lançamento"
        accessibilityLabel="Buscar lançamento"
      />
      <BankFilter
        value={filters.bank}
        onChange={(bank) => update({ bank })}
        appearance="list"
        wrap={wrap}
      />
      <View className="flex-row flex-wrap items-center gap-2">
        <SelectPill
          size={36}
          icon="calendar"
          label={monthPillLabel(filters.month)}
          accessibilityLabel={`Mês: ${monthLabel(filters.month)}`}
          onPress={() => setOpen('month')}
        />
        <SelectPill
          size={36}
          icon="tag"
          label={categoryText}
          accessibilityLabel={`Categoria: ${filters.categoryId === 'all' ? 'todas' : categoryText}`}
          onPress={() => setOpen('category')}
        />
        <SelectPill
          size={36}
          icon="filter"
          label={directionText}
          accessibilityLabel={`Tipo: ${directionText}`}
          onPress={() => setOpen('direction')}
        />
      </View>
      <OptionSheet
        open={open === 'month'}
        onClose={close}
        title="Mês"
        value={filters.month}
        options={months.map((month) => ({ value: month, label: monthLabel(month) }))}
        onChange={(month) => update({ month })}
      />
      <OptionSheet
        open={open === 'category'}
        onClose={close}
        title="Categoria"
        value={filters.categoryId}
        options={[
          { value: 'all' as const, label: 'Todas as categorias' },
          ...categories.map((id) => ({ value: id, label: CATEGORY_LABELS[id] })),
        ]}
        onChange={(categoryId) => update({ categoryId })}
      />
      <OptionSheet
        open={open === 'direction'}
        onClose={close}
        title="Saídas e entradas"
        value={filters.direction}
        options={DIRECTIONS}
        onChange={(direction) => update({ direction })}
      />
    </View>
  );
}
