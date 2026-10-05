import { View } from 'react-native';

import { MoneyText, Text } from '@/components/ui';

import type { StockAsset } from '../../assets';

/** Last price in Fraunces, the day's change and when it was updated. */
export function StockQuoteHeadline({
  asset,
  large = false,
}: {
  asset: StockAsset;
  large?: boolean;
}) {
  const tone = asset.change.up ? 'positive' : 'negative';
  return (
    <View className="gap-0.5">
      <MoneyText
        value={asset.price}
        serif
        weight="extrabold"
        size={large ? 40 : 36}
        leading={1}
        tracking={-0.02}
      />
      <Text size={15} weight="bold" tone={tone} tabular>
        <Text size={11} tone={tone} accessibilityElementsHidden>
          {asset.change.up ? '▲' : '▼'}
        </Text>{' '}
        {asset.change.text}
      </Text>
      <Text size={12} tone="subtle">
        {asset.updated}
      </Text>
    </View>
  );
}
