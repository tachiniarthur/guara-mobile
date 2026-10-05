import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MataSurface } from '@/components/illustrations';
import { ResponsiveGrid, SectionCard } from '@/components/layout';
import { Icon, LinkButton, MoneyText, SegmentedControl, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';

import { OTHER_POSITIONS, PORTFOLIO, POSITION_GROUPS, type Position } from '../data';

import { PositionItem } from './PositionItem';

type Grouping = 'list' | 'byClass';
type Sort = 'value' | 'share';

const SORT_LABEL: Record<Sort, string> = { value: 'Maior valor', share: '% da carteira' };

/** Positions grouped by class (mata band per class) or as a flat list, sortable. */
export function PositionsCard() {
  const { isTablet } = useBreakpoint();
  const [grouping, setGrouping] = useState<Grouping>('byClass');
  const [sort, setSort] = useState<Sort>('value');

  const ordered = (positions: Position[]) =>
    [...positions].sort((a, b) => (sort === 'value' ? b.value - a.value : b.share - a.share));

  const items = (positions: Position[]) => (
    <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={8} stretch={false}>
      {ordered(positions).map((position) => (
        <PositionItem key={position.id} position={position} />
      ))}
    </ResponsiveGrid>
  );

  return (
    <SectionCard
      title="Posições"
      description={`${PORTFOLIO.positionsCount} posições`}
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={12}
      action={
        <LinkButton label={`Ver as ${PORTFOLIO.positionsCount}`} size={15} className="min-h-6" />
      }
    >
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <SegmentedControl
          accessibilityLabel="Agrupar posições"
          track="input"
          size="sm"
          textSize={14}
          value={grouping}
          onChange={setGrouping}
          options={[
            { value: 'list', label: 'Lista' },
            { value: 'byClass', label: 'Por classe' },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ordenar posições. Atual: ${SORT_LABEL[sort].toLowerCase()} primeiro. Opções: valor da posição ou % da carteira`}
          onPress={() => {
            haptics.selection();
            setSort((value) => (value === 'value' ? 'share' : 'value'));
          }}
          className="h-9 flex-row items-center gap-1.5 rounded-full border border-border-strong px-3 active:bg-surface-pressed"
        >
          <Icon name="arrowDown" size={16} color={colors.brand.DEFAULT} />
          <Text size={14} weight="semibold">
            {SORT_LABEL[sort]}
          </Text>
          <Icon name="chevronDown" size={16} color={colors.foreground.muted} />
        </Pressable>
      </View>
      {grouping === 'byClass'
        ? POSITION_GROUPS.map((group) => (
            <View key={group.label} className="gap-2">
              <MataSurface
                veil={[0.82, 0.55, 0.2]}
                style={{ borderColor: colors.avatarRing }}
                className="mt-1.5 flex-row items-baseline justify-between gap-2 rounded-14 border px-3.5 py-3"
              >
                <Text size={15} weight="bold" accessibilityRole="header">
                  {group.label}
                </Text>
                <Text size={14} tone="soft" tabular>
                  <MoneyText value={group.total} size={14} weight="bold" /> ·{' '}
                  {group.share.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%
                </Text>
              </MataSurface>
              {items(group.positions)}
            </View>
          ))
        : items(POSITION_GROUPS.flatMap((group) => group.positions))}
      <View className="flex-row items-center justify-between gap-2 border-t border-border px-0.5 py-3">
        <Text size={14} tone="muted">
          Outras {OTHER_POSITIONS.count} posições
        </Text>
        <Text size={14} tone="muted" tabular>
          <MoneyText value={OTHER_POSITIONS.total} size={14} weight="bold" /> ·{' '}
          {OTHER_POSITIONS.share.toLocaleString('pt-BR')}%
        </Text>
      </View>
      <View className="flex-row items-baseline justify-between gap-2 border-t border-border-strong px-0.5 pt-3">
        <Text serif weight="bold" size={17}>
          Total da carteira
        </Text>
        <MoneyText value={PORTFOLIO.total} serif weight="extrabold" size={20} />
      </View>
      <Text variant="caption" tone="muted">
        Toque numa posição para ver classe, instrumento, risco, quantidade e preço médio. O risco
        vem do cadastro do ativo (volatilidade, crédito e liquidez) e pode ser ajustado.
      </Text>
    </SectionCard>
  );
}
