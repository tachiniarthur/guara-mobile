import { colors } from '@guara/ui-tokens';
import { EMPTY } from '@guara/utils';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { Button, DataRow, Icon, Text } from '@/components/ui';

import type { FundAsset, StockAsset } from '../../assets';

/** Stock position: result since purchase, quantities and the active price alert. */
export function StockPositionCard({ asset, wide = false }: { asset: StockAsset; wide?: boolean }) {
  const router = useRouter();
  const { position } = asset;

  return (
    <SectionCard
      title="Sua posição"
      description={position.caption}
      padding={wide ? 20 : 18}
      gap={16}
    >
      <View className="gap-0.5 rounded-16 bg-positive-muted px-4 py-3.5">
        <Text size={13} tone="muted">
          Resultado desde a compra
        </Text>
        <Text serif weight="extrabold" size={26} tone="positive" tabular leading={1.3}>
          {position.result.amount}{' '}
          <Text serif weight="extrabold" size={16} tone="positive" tabular>
            {position.result.percent}
          </Text>
        </Text>
      </View>
      <View>
        {position.rows.map((row) => (
          <DataRow key={row.label} label={row.label} value={row.value} density="compact" />
        ))}
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${position.alert.title}. ${position.alert.detail}`}
        onPress={() => router.navigate('/alerts')}
        className="flex-row items-center gap-2.5 rounded-16 bg-surface-muted px-3.5 py-3 active:bg-surface-pressed"
      >
        <Icon name="bell" size={18} color={colors.brand.DEFAULT} />
        <View className="min-w-0 flex-1">
          <Text size={14} weight="bold" leading={1.35}>
            {position.alert.title}
          </Text>
          <Text size={13} tone="muted" leading={1.35}>
            {position.alert.detail}
          </Text>
        </View>
        <Icon name="chevronRight" size={16} color={colors.foreground.muted} />
      </Pressable>
    </SectionCard>
  );
}

/** Fund/fixed-income position: quantities, share of the portfolio and where it comes from. */
export function FundPositionCard({ asset }: { asset: FundAsset }) {
  const router = useRouter();
  const { position, header } = asset;

  return (
    <SectionCard
      title="Sua posição"
      titleSize={18}
      gap={16}
      action={
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Editar posição"
          hitSlop={12}
          onPress={() =>
            router.navigate({ pathname: '/new-manual-asset', params: { ticker: header.ticker } })
          }
          className="flex-row items-center gap-1.5"
        >
          <Icon name="pencil" size={16} color={colors.foreground.DEFAULT} />
          <Text size={14} weight="bold">
            Editar
          </Text>
        </Pressable>
      }
    >
      <View style={{ marginTop: -6 }}>
        {position.rows.map((row) => (
          <DataRow key={row.label} label={row.label} value={row.value} tone={row.tone} />
        ))}
      </View>
      <Text size={13} tone="muted">
        {position.note}
      </Text>
    </SectionCard>
  );
}

/** "Você ainda não tem PETR4": the quote stays; the position fields wait with "—". */
export function NotHeldPositionCard({ ticker, wide = false }: { ticker: string; wide?: boolean }) {
  const router = useRouter();
  return (
    <SectionCard title="Sua posição" padding={wide ? 20 : 18} gap={14}>
      <View className="gap-1.5">
        <Text size={16} weight="bold">
          {`Você ainda não tem ${ticker}`}
        </Text>
        <Text size={14} tone="muted" leading={1.55}>
          A cotação e os dados da empresa continuam aqui. Os campos da sua posição ficam com “—” até
          você adicionar o ativo.
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button
          size="md"
          className="h-10 px-4.5"
          onPress={() => router.navigate({ pathname: '/new-manual-asset', params: { ticker } })}
        >
          Adicionar à carteira
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="h-10 px-4.5"
          onPress={() => router.navigate({ pathname: '/new-price-alert', params: { ticker } })}
        >
          Criar alerta de preço
        </Button>
      </View>
      <View>
        {['Quantidade', 'Preço médio', 'Resultado', 'Proventos recebidos'].map((label) => (
          <DataRow key={label} label={label} value={EMPTY} density="compact" />
        ))}
      </View>
    </SectionCard>
  );
}
