import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AllocationBar, InteractiveGlobe, type GlobeMarker } from '@/components/charts';
import { SectionCard } from '@/components/layout';
import { Icon, IconButton, MoneyText, Span, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { EXPOSURE, EXPOSURE_ASSETS, type ExposureKey } from '../data';

const MARKERS: GlobeMarker[] = EXPOSURE.flatMap((item) =>
  item.place
    ? [
        {
          key: item.key,
          label: `${item.label} · ${item.share}%`,
          lat: item.place.lat,
          lon: item.place.lon,
          color: item.color,
          countryId: item.place.countryId,
        },
      ]
    : [],
);
const NO_COUNTRY = EXPOSURE.find((item) => item.place === null);
// The satellite's chip names what is in it ("Bitcoin · 10%"), as on the web.
const ORBIT = NO_COUNTRY
  ? {
      key: NO_COUNTRY.key,
      label: `${EXPOSURE_ASSETS[NO_COUNTRY.key][0]?.name ?? NO_COUNTRY.label} · ${NO_COUNTRY.share}%`,
      color: NO_COUNTRY.color,
    }
  : undefined;

const SUMMARY = EXPOSURE.map((item) => `${item.label} ${item.share}%`).join(', ');

/** Investments of the selected place, each opening its asset page. */
function PlaceAssets({ placeKey, onClose }: { placeKey: ExposureKey; onClose: () => void }) {
  const router = useRouter();
  const place = EXPOSURE.find((item) => item.key === placeKey);
  if (!place) return null;
  const assets = EXPOSURE_ASSETS[placeKey];

  return (
    <View
      accessibilityLiveRegion="polite"
      className="gap-1 rounded-18 border border-border bg-surface-input p-4"
    >
      <View className="flex-row items-center gap-2.5">
        <View className="h-3 w-3 rounded-full" style={{ backgroundColor: place.color }} />
        <View className="min-w-0 flex-1">
          <Text size={15} weight="bold" accessibilityRole="header">
            Ativos {place.where}
          </Text>
          <Text size={12} tone="subtle">
            {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'} · {place.share}% da carteira
          </Text>
        </View>
        <IconButton icon="close" size={36} accessibilityLabel="Fechar ativos" onPress={onClose} />
      </View>
      {assets.map((asset, index) => {
        const content = (
          <>
            <View className="min-w-0 flex-1">
              <Text size={14} weight="bold" leading={1.35}>
                {asset.name}
              </Text>
              <Text size={12} tone="subtle" leading={1.35} numberOfLines={1}>
                {asset.detail}
              </Text>
            </View>
            <MoneyText value={asset.value} size={14} weight="bold" />
            {asset.ticker ? (
              <Icon name="chevronRight" size={16} color={colors.foreground.muted} />
            ) : null}
          </>
        );
        const rowClass = cn(
          'min-h-13 flex-row items-center gap-3 py-2',
          index > 0 && 'border-t border-border',
        );
        const ticker = asset.ticker;
        return ticker ? (
          <Pressable
            key={asset.name}
            accessibilityRole="link"
            accessibilityLabel={`${asset.name}, ${asset.detail}`}
            onPress={() =>
              router.navigate({ pathname: '/investments/asset/[ticker]', params: { ticker } })
            }
            className={cn(rowClass, 'active:opacity-80')}
          >
            {content}
          </Pressable>
        ) : (
          <View key={asset.name} className={rowClass}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

/** "Onde seu dinheiro está no mundo": interactive globe, country bar and list. */
export function ExposureCard() {
  const { isTablet } = useBreakpoint();
  const reduceMotion = useReduceMotion();
  const [selected, setSelected] = useState<ExposureKey | null>(null);
  const select = (key: string | null) => {
    const next = EXPOSURE.find((item) => item.key === key)?.key ?? null;
    if (next !== null) haptics.selection();
    setSelected(next);
  };

  const list = (
    <View accessibilityRole="radiogroup" accessibilityLabel="Países">
      {EXPOSURE.map((item) => {
        const active = item.key === selected;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityHint="Mostra os ativos e gira o globo até lá"
            onPress={() => select(active ? null : item.key)}
            className={cn(
              'flex-row items-center gap-3 rounded-14 border-b border-border px-2 py-3 active:bg-surface-pressed',
              active && 'border-transparent bg-surface-muted',
            )}
          >
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <View className="min-w-0 flex-1">
              <Text size={14} weight="bold" leading={1.35}>
                {item.label}
              </Text>
              <Text size={12} tone="subtle" leading={1.35}>
                {item.detail}
              </Text>
            </View>
            <View className="items-end">
              <Text
                serif
                weight="bold"
                size={19}
                tabular
                leading={1.35}
                style={{ color: item.color }}
              >
                {item.share}%
              </Text>
              <MoneyText value={item.value} wholeUnits size={12} tone="muted" leading={1.35} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SectionCard
      title="Onde seu dinheiro está no mundo"
      description="Exposição dos seus investimentos por país"
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={14}
    >
      <View className={isTablet ? 'flex-row items-center gap-6' : 'gap-3.5'}>
        <View className={isTablet ? 'w-[300px] gap-1.5' : 'gap-1.5 px-3'}>
          <InteractiveGlobe
            markers={MARKERS}
            orbit={ORBIT}
            selectedKey={selected}
            onSelect={select}
            autoRotate={!reduceMotion}
            accessibilityLabel={`Globo com a exposição por país: ${SUMMARY}`}
          />
          <View className="flex-row items-center justify-center gap-1.5">
            <Icon name="refresh" size={14} color={colors.foreground.subtle} />
            <Text size={12} tone="subtle">
              Arraste para girar · toque num país
            </Text>
          </View>
        </View>
        <View className={isTablet ? 'min-w-0 flex-1 gap-3.5' : 'gap-3.5'}>
          <AllocationBar
            height={12}
            accessibilityLabel={SUMMARY}
            segments={EXPOSURE.map((item) => ({
              label: item.label,
              percent: item.share,
              color: item.color,
            }))}
          />
          {list}
        </View>
      </View>
      {selected ? <PlaceAssets placeKey={selected} onClose={() => setSelected(null)} /> : null}
      <Text variant="caption" tone="muted">
        <Span weight="bold" tone="default">
          18%
        </Span>{' '}
        do que você investiu não depende só da economia brasileira. Isso ajuda a diversificar o
        risco.
      </Text>
    </SectionCard>
  );
}
