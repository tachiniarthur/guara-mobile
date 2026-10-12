import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { DonutChart } from '@/components/charts';
import { Text } from '@/components/ui';

import { shareText, type GroupRow } from '../../lib/allocation';

function Ring({
  title,
  caption,
  value,
  shares,
  label,
  size,
}: {
  title?: string;
  caption: string;
  value: string;
  shares: { key: string; value: number; color: string }[];
  label: string;
  size: number;
}) {
  return (
    <View className="min-w-0 flex-1 items-center gap-2.5">
      {title ? (
        <Text size={14} weight="bold">
          {title}
        </Text>
      ) : null}
      <View accessible accessibilityRole="image" accessibilityLabel={label}>
        <DonutChart
          size={size}
          strokeWidth={size >= 150 ? 20 : 18}
          gap={2.5}
          trackColor={colors.surface.muted}
          segments={shares}
        >
          <Text size={12} tone="subtle" leading={1.2}>
            {caption}
          </Text>
          <Text serif weight="bold" size={size >= 150 ? 16 : 14} leading={1.2}>
            {value}
          </Text>
        </DonutChart>
      </View>
    </View>
  );
}

const groupsLabel = (groups: readonly GroupRow[], key: 'current' | 'target') =>
  groups.map((group) => `${group.label} ${shareText(group[key])}`).join(', ');

/** Donut of the profile's target ("Alvo · Moderado"), by group. */
export function TargetRing({
  groups,
  profileLabel,
  size = 132,
}: {
  groups: readonly GroupRow[];
  profileLabel: string;
  size?: number;
}) {
  return (
    <Ring
      caption="Alvo"
      value={profileLabel}
      size={size}
      label={`Alvo do perfil ${profileLabel}: ${groupsLabel(groups, 'target')}`}
      shares={groups.map((group) => ({ key: group.key, value: group.target, color: group.color }))}
    />
  );
}

/** Color key of the 5 groups. */
export function GroupLegend({ groups }: { groups: readonly GroupRow[] }) {
  return (
    <View className="flex-row flex-wrap justify-center gap-x-3.5 gap-y-1.5">
      {groups.map((group) => (
        <View key={group.key} className="flex-row items-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: group.color }} />
          <Text size={13} tone="muted">
            {group.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** "Sua carteira" × "Perfil Moderado": both donuts by group and the legend. */
export function AllocationRings({
  groups,
  profileLabel,
  positionsCount,
}: {
  groups: readonly GroupRow[];
  profileLabel: string;
  positionsCount: number;
}) {
  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <Ring
          title="Sua carteira"
          caption="Atual"
          value={`${positionsCount} ${positionsCount === 1 ? 'ativo' : 'ativos'}`}
          size={128}
          label={`Sua carteira: ${groupsLabel(groups, 'current')}`}
          shares={groups.map((group) => ({
            key: group.key,
            value: group.current,
            color: group.color,
          }))}
        />
        <Ring
          title={`Perfil ${profileLabel}`}
          caption="Alvo"
          value={profileLabel}
          size={128}
          label={`Alvo do perfil ${profileLabel}: ${groupsLabel(groups, 'target')}`}
          shares={groups.map((group) => ({
            key: group.key,
            value: group.target,
            color: group.color,
          }))}
        />
      </View>
      <GroupLegend groups={groups} />
    </View>
  );
}
