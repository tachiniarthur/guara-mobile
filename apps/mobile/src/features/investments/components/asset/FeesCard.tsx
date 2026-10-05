import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ResponsiveGrid, SectionCard } from '@/components/layout';
import { Icon, InfoTip, Text } from '@/components/ui';

import { COST_INFO, type FundAsset } from '../../assets';

/** "Taxas e condições": total yearly cost and the detailed fees (2 columns on tablets). */
export function FeesCard({ asset }: { asset: FundAsset }) {
  const [open, setOpen] = useState(true);
  const { fees } = asset;

  return (
    <SectionCard title="Taxas e condições" gap={16}>
      <View className="gap-0.5">
        <View className="flex-row items-center">
          <Text size={14} tone="muted">
            Custo total
          </Text>
          <InfoTip text={COST_INFO} />
        </View>
        <Text serif weight="extrabold" size={34} leading={1.1} tabular>
          {fees.total}
        </Text>
        <Text size={13} tone="subtle">
          {fees.caption}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        className="flex-row items-center gap-1.5 border-t border-border pt-3.5"
      >
        <Text size={16} weight="bold">
          Taxas detalhadas
        </Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevronDown" size={16} color={colors.foreground.muted} />
        </View>
      </Pressable>
      {open ? (
        <ResponsiveGrid columns={{ tablet: 2 }} gap={10} stretch>
          {fees.rows.map((row) => (
            <View key={row.label} className="flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5">
              <Text size={14} tone="muted">
                {row.label}
              </Text>
              <Text size={15} weight="semibold" leading={1.45}>
                {row.value}
              </Text>
            </View>
          ))}
        </ResponsiveGrid>
      ) : null}
    </SectionCard>
  );
}
