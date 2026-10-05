import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { EmptyValue, Icon, MoneyText, Text } from '@/components/ui';
import { haptics } from '@/lib/haptics';

import type { Position } from '../data';
import { changeText, shareText } from '../lib/positions';

import { RiskPill } from './RiskPill';

const ORIGIN_ICON = { openFinance: 'link', manual: 'user', chat: 'message' } as const;

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="min-w-0 gap-0.5" style={{ width: '47%' }}>
      <Text size={13} tone="muted">
        {label}
      </Text>
      {children}
    </View>
  );
}

/** Position row that expands into class, instrument, risk, share, quantity and average price. */
export function PositionItem({
  position,
  defaultOpen = false,
  onAdjustRisk,
}: {
  position: Position;
  defaultOpen?: boolean;
  onAdjustRisk: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const up = position.change >= 0;
  const changeLabel = changeText(position.change);

  return (
    <View className="overflow-hidden rounded-18 border border-border bg-surface-input">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${position.name}, ${position.detail}`}
        onPress={() => {
          haptics.selection();
          setOpen((value) => !value);
        }}
        className="min-h-11 flex-row items-center gap-3 px-4 py-3.5"
      >
        <View className="min-w-0 flex-1">
          <Text size={16} weight="bold" leading={1.35}>
            {position.name}
          </Text>
          <Text size={13} tone="muted" leading={1.35}>
            {position.detail}
          </Text>
        </View>
        <View className="items-end">
          <MoneyText value={position.value} size={16} weight="bold" leading={1.35} />
          <Text size={14} weight="bold" tabular tone={up ? 'positive' : 'negative'} leading={1.35}>
            <Text size={11} tone={up ? 'positive' : 'negative'}>
              {up ? '▲' : '▼'}
            </Text>{' '}
            {changeLabel}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevronDown" size={18} color={colors.foreground.muted} />
        </View>
      </Pressable>
      {open ? (
        <View className="gap-3.5 px-4 pb-4 pt-1">
          <View className="flex-row flex-wrap justify-between gap-y-3">
            <Detail label="Classe">
              <Text size={15} weight="semibold">
                {position.className}
              </Text>
            </Detail>
            <Detail label="Instrumento">
              <Text size={15} weight="semibold">
                {position.instrument}
              </Text>
            </Detail>
            <Detail label="Risco">
              <RiskPill risk={position.risk} assetName={position.name} onPress={onAdjustRisk} />
            </Detail>
            <Detail label="% da carteira">
              <Text size={15} weight="semibold" tabular>
                {shareText(position.share)}
              </Text>
            </Detail>
            <Detail label="Quantidade">
              {position.quantity ? (
                <Text size={15} weight="semibold" tabular>
                  {position.quantity}
                </Text>
              ) : (
                <EmptyValue size={15} weight="semibold" />
              )}
            </Detail>
            <Detail label="Preço médio">
              <MoneyText value={position.averagePrice} size={15} weight="semibold" />
            </Detail>
          </View>
          <View className="flex-row items-center justify-between gap-3 border-t border-border pt-3">
            <View className="min-w-0 flex-1 flex-row items-start gap-1.5">
              <View style={{ marginTop: 2 }}>
                <Icon
                  name={ORIGIN_ICON[position.origin.kind]}
                  size={14}
                  color={colors.foreground.soft}
                />
              </View>
              <View>
                <Text size={13} tone="soft" leading={1.35}>
                  {position.origin.label}
                </Text>
                {position.origin.updated ? (
                  <Text size={12} tone="muted" leading={1.35}>
                    {position.origin.updated}
                  </Text>
                ) : null}
              </View>
            </View>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Abrir ativo ${position.name}`}
              onPress={() =>
                router.navigate({
                  pathname: '/investments/asset/[ticker]',
                  params: { ticker: position.ticker },
                })
              }
              className="h-10 flex-row items-center gap-1.5 rounded-full bg-foreground px-3.5 active:opacity-90"
            >
              <Text size={14} weight="bold" tone="inverse">
                Abrir ativo
              </Text>
              <Icon name="chevronRight" size={16} color={colors.foreground.inverse} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
