import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useState } from 'react';

import { StateSlot } from '@/components/feedback';
import { Card, DataRow, Icon, Text } from '@/components/ui';

import { RISK_INFO, type FundAsset } from '../../assets';
import type { Position } from '../../data';
import { usePositions } from '../../hooks/usePositions';
import { RiskPill } from '../RiskPill';
import { RiskSheet } from '../RiskSheet';

/** "Detalhes do ativo": name, class, instrument, issuer and the computed risk. */
export function AssetDetailsCard({ asset }: { asset: FundAsset }) {
  const router = useRouter();
  const positions = usePositions();
  const position = positions.positions.find((item) => item.ticker === asset.header.ticker);
  const [riskTarget, setRiskTarget] = useState<Position | null>(null);
  const { details } = asset;
  const [name, ...rows] = details.rows;

  return (
    <Card padding="none" className="min-w-0 gap-4 p-5">
      <View className="-mx-5 flex-row items-center gap-2.5 border-b border-border px-5 pb-3.5">
        <Icon name="fileText" size={18} color={colors.foreground.muted} />
        <Text size={16} weight="bold" accessibilityRole="header">
          Detalhes do ativo
        </Text>
      </View>
      <StateSlot empty={null}>
        <View style={{ marginTop: -8 }}>
          {name ? (
            <DataRow label={name.label} value={name.value} layout="stacked" density="relaxed" />
          ) : null}
          {rows.map((row) => (
            <DataRow
              key={row.label}
              label={row.label}
              value={row.value}
              info={row.info}
              density="relaxed"
            />
          ))}
          <DataRow
            label="Risco"
            value={
              position ? (
                <RiskPill
                  risk={position.risk}
                  assetName={position.name}
                  onPress={() => setRiskTarget(position)}
                />
              ) : (
                <RiskPill risk={details.risk} />
              )
            }
            info={RISK_INFO}
            density="relaxed"
          />
        </View>
        <View>
          {asset.moreDetails ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                router.navigate({
                  pathname: '/investments/asset/[ticker]/details',
                  params: { ticker: asset.header.ticker },
                })
              }
              className="min-h-11 flex-row items-center gap-2 self-start pt-1"
            >
              <Icon name="moreHorizontal" size={18} color={colors.foreground.muted} />
              <Text size={14} weight="semibold" tone="muted">
                Mais detalhes
              </Text>
            </Pressable>
          ) : null}
          <Text size={13} tone="subtle">
            {details.extra}
          </Text>
        </View>
      </StateSlot>
      <RiskSheet
        target={riskTarget}
        onClose={() => setRiskTarget(null)}
        onChange={positions.setRisk}
        onReset={positions.clearRisk}
      />
    </Card>
  );
}
