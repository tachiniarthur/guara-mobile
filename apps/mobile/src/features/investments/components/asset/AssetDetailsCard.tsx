import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { toast } from '@/components/feedback';
import { DataRow, Icon, Text } from '@/components/ui';

import { RISK_INFO, type FundAsset } from '../../assets';
import { RiskPill } from '../RiskPill';

/** "Detalhes do ativo": name, class, instrument, issuer and the computed risk. */
export function AssetDetailsCard({ asset }: { asset: FundAsset }) {
  const { details } = asset;
  const [name, ...rows] = details.rows;

  return (
    <View className="min-w-0 gap-4 rounded-24 border border-border bg-surface p-5">
      <View className="-mx-5 flex-row items-center gap-2.5 border-b border-border px-5 pb-3.5">
        <Icon name="fileText" size={18} color={colors.foreground.muted} />
        <Text size={16} weight="bold" accessibilityRole="header">
          Detalhes do ativo
        </Text>
      </View>
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
          value={<RiskPill risk={details.risk} />}
          info={RISK_INFO}
          density="relaxed"
        />
      </View>
      <View>
        <Pressable
          accessibilityRole="button"
          onPress={() => toast.info('Mais detalhes do ativo em breve.')}
          className="min-h-11 flex-row items-center gap-2 self-start pt-1"
        >
          <Icon name="moreHorizontal" size={18} color={colors.foreground.muted} />
          <Text size={14} weight="semibold" tone="muted">
            Mais detalhes
          </Text>
        </Pressable>
        <Text size={13} tone="subtle">
          {details.extra}
        </Text>
      </View>
    </View>
  );
}
