import { formatCentsForSpeech } from '@guara/utils';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { MoneyText, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { Position } from '../data';
import { changeText, shareText, type PositionClassGroup } from '../lib/positions';

import { PositionClassBand } from './PositionClassBand';
import { PositionChange } from './PositionRow';
import { RiskPill } from './RiskPill';

const COLUMNS = [
  { key: 'asset', label: 'Ativo', flex: 2.3, align: 'left' },
  { key: 'risk', label: 'Risco', flex: 1, align: 'left' },
  { key: 'origin', label: 'Origem', flex: 1.7, align: 'left' },
  { key: 'total', label: 'Total', flex: 1.6, align: 'right' },
  { key: 'share', label: '% carteira', flex: 1.15, align: 'right' },
  { key: 'change', label: 'Hoje', flex: 1.15, align: 'right' },
] as const;

const TOTAL_FLEX = COLUMNS.reduce((sum, column) => sum + column.flex, 0);

export interface PositionsTableProps {
  /** Grouped by class (with mata bands) or a flat list. */
  groups: PositionClassGroup[] | null;
  positions: Position[];
  onOpen: (position: Position) => void;
  onAdjustRisk: (position: Position) => void;
}

/** "Todas as posições" on tablets: Ativo | Risco | Origem | Total | % carteira | Hoje. */
export function PositionsTable({ groups, positions, onOpen, onAdjustRisk }: PositionsTableProps) {
  const [width, setWidth] = useState(0);
  // Fixed widths keep every row aligned (Yoga lets a wide cell push its neighbours).
  const cell = (index: number, children: ReactNode) => {
    const column = COLUMNS[index]!;
    return (
      <View
        key={column.key}
        style={{ width: (width * column.flex) / TOTAL_FLEX }}
        className={cn('px-2 py-2.5', column.align === 'right' && 'items-end')}
      >
        {children}
      </View>
    );
  };

  const row = (position: Position) => (
    <View key={position.id} className="flex-row items-center border-b border-border">
      {cell(
        0,
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${position.name}, ${position.listDetail}. ${formatCentsForSpeech(position.value)}, ${shareText(position.share)} da carteira, hoje ${changeText(position.change)}`}
          onPress={() => onOpen(position)}
          className="active:opacity-80"
        >
          <Text size={14} weight="bold" leading={1.3}>
            {position.name}
          </Text>
          <Text size={12} tone="subtle" leading={1.3} numberOfLines={1}>
            {position.listDetail}
          </Text>
        </Pressable>,
      )}
      {cell(
        1,
        <RiskPill
          risk={position.risk}
          size="sm"
          assetName={position.name}
          onPress={() => onAdjustRisk(position)}
        />,
      )}
      {cell(
        2,
        <Text size={12} tone="muted" numberOfLines={2}>
          {position.origin.label}
        </Text>,
      )}
      {cell(3, <MoneyText value={position.value} size={14} weight="bold" numberOfLines={1} />)}
      {cell(
        4,
        <Text size={14} tabular>
          {shareText(position.share)}
        </Text>,
      )}
      {cell(5, <PositionChange change={position.change} />)}
    </View>
  );

  return (
    <View
      accessibilityLabel="Posições da carteira"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <>
          <View className="flex-row border-b border-border-strong">
            {COLUMNS.map((column, index) =>
              cell(
                index,
                <Text size={12} weight="bold" tone="subtle" numberOfLines={1}>
                  {column.label}
                </Text>,
              ),
            )}
          </View>
          {groups
            ? groups.map((group) => (
                <View key={group.key}>
                  <View className="pb-1 pt-2">
                    <PositionClassBand
                      label={group.label}
                      total={group.total}
                      share={group.share}
                      count={group.positions.length}
                    />
                  </View>
                  {group.positions.map(row)}
                </View>
              ))
            : positions.map(row)}
        </>
      ) : null}
    </View>
  );
}
