import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';

import { StateMessage } from '@/components/feedback';
import { MataButton } from '@/components/illustrations';
import { ResponsiveGrid, SectionCard } from '@/components/layout';
import { Icon, LinkButton, MoneyText, SegmentedControl, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';

import type { Position } from '../data';
import { usePositions } from '../hooks/usePositions';
import { groupPositions, previewPositions, shareText } from '../lib/positions';

import { PositionClassBand } from './PositionClassBand';
import { PositionItem } from './PositionItem';
import { RiskSheet } from './RiskSheet';

/** Positions shown in the card; the rest are summed in "Outras N posições". */
const PREVIEW_COUNT = 6;

type Grouping = 'list' | 'byClass';
type Sort = 'value' | 'share';

const SORT_LABEL: Record<Sort, string> = { value: 'Maior valor', share: '% da carteira' };

/** Positions grouped by class (mata band per class) or as a flat list, sortable. */
export function PositionsCard() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const data = usePositions();
  const [riskTarget, setRiskTarget] = useState<Position | null>(null);
  const { shown, others } = previewPositions(data.positions, PREVIEW_COUNT);
  const [grouping, setGrouping] = useState<Grouping>('byClass');
  const [sort, setSort] = useState<Sort>('value');

  const ordered = (positions: Position[]) =>
    [...positions].sort((a, b) => (sort === 'value' ? b.value - a.value : b.share - a.share));

  const items = (positions: Position[]) => (
    <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={8}>
      {ordered(positions).map((position) => (
        <PositionItem
          key={position.id}
          position={position}
          onAdjustRisk={() => setRiskTarget(position)}
        />
      ))}
    </ResponsiveGrid>
  );

  return (
    <SectionCard
      title="Posições"
      description={`${data.positions.length} posições`}
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={12}
      empty={
        <StateMessage
          icon="trendingUp"
          title="Nenhum investimento ainda"
          description="Conecte o banco ou a corretora pela Malvo, ou cadastre à mão. A carteira é comparada com o seu perfil."
          action={
            <MataButton
              label="Adicionar investimento"
              size={44}
              onPress={() => router.navigate('/new-manual-asset')}
            />
          }
        />
      }
      action={
        <LinkButton
          label={`Ver as ${data.positions.length}`}
          size={15}
          className="min-h-6"
          onPress={() => router.navigate('/investments/positions')}
        />
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
        ? groupPositions(shown).map((group) => (
            <View key={group.key} className="gap-2">
              <PositionClassBand label={group.label} total={group.total} share={group.share} />
              {items(group.positions)}
            </View>
          ))
        : items(shown)}
      {others ? (
        <View className="flex-row items-center justify-between gap-2 border-t border-border px-0.5 py-3">
          <Text size={14} tone="muted">
            Outras {others.count} posições
          </Text>
          <Text size={14} tone="muted" tabular>
            <MoneyText value={others.total} size={14} weight="bold" /> · {shareText(others.share)}
          </Text>
        </View>
      ) : null}
      <View className="flex-row items-baseline justify-between gap-2 border-t border-border-strong px-0.5 pt-3">
        <Text serif weight="bold" size={17}>
          Total da carteira
        </Text>
        <MoneyText value={data.total} serif weight="extrabold" size={20} />
      </View>
      <Text variant="caption" tone="muted">
        Toque numa posição para ver classe, instrumento, risco, quantidade e preço médio. O risco
        vem do cadastro do ativo (volatilidade, crédito e liquidez) e pode ser ajustado.
      </Text>
      <RiskSheet
        target={riskTarget}
        onClose={() => setRiskTarget(null)}
        onChange={data.setRisk}
        onReset={data.clearRisk}
      />
    </SectionCard>
  );
}
