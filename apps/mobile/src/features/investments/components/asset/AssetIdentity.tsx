import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { BrazilFlag } from '@/components/illustrations';
import { Icon, Text } from '@/components/ui';

import type { AssetHeader } from '../../assets';

export interface AssetIdentityProps {
  header: AssetHeader;
  /** Tile side (design: 48 on phones, 56 on tablets). */
  tile?: 48 | 56;
  /** Title size (design: 26 on phones, 30 or 34 on tablets). */
  titleSize?: 26 | 30 | 34;
}

/** Mark tile, name, class badge and origin of an asset. */
export function AssetIdentity({ header, tile = 48, titleSize = 26 }: AssetIdentityProps) {
  const markSize = header.mark.length >= 3 ? 15 : header.mark === 'BR' && tile === 48 ? 17 : 20;

  return (
    <View className="min-w-0 flex-row items-center gap-3.5">
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="items-center justify-center rounded-16 border"
        style={{
          width: tile,
          height: tile,
          backgroundColor: colors.assetMark[header.markTone],
          borderColor: colors.markRing,
        }}
      >
        <Text serif weight="extrabold" size={markSize} leading={1}>
          {header.mark}
        </Text>
      </View>
      <View className="min-w-0 flex-1" style={{ gap: header.region ? 4 : 2 }}>
        <View className="flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
          <Text
            serif
            weight="extrabold"
            size={titleSize}
            leading={1.1}
            tracking={-0.01}
            accessibilityRole="header"
          >
            {header.title}
          </Text>
          <View className="rounded-full bg-surface-muted px-2.5 py-[3px]">
            <Text size={12} weight="bold" tone="muted" numberOfLines={1}>
              {header.badge}
            </Text>
          </View>
        </View>
        {header.region ? (
          <View className="flex-row flex-wrap items-center gap-1.5">
            {header.region === 'BRA' ? (
              <BrazilFlag />
            ) : (
              <Icon name="globe" size={16} color={colors.positive.DEFAULT} />
            )}
            <Text size={14} tone="muted">
              {header.region}
            </Text>
            <Text size={14} tone="subtle" accessibilityElementsHidden>
              ·
            </Text>
            <Text size={14} tone="muted">
              {header.subtitle}
            </Text>
          </View>
        ) : (
          <Text size={14} tone="muted">
            {header.subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
