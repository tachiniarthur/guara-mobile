import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui';
import { conversationHref } from '@/navigation';

import type { Asset } from '../../assets';

export interface AssetActionsProps {
  asset: Asset;
  /**
   * `grid`: alert on top, two halves below (stock, phone). `stack`: one per line (phone).
   * `row`: side by side, wrapping (tablet).
   */
  layout: 'grid' | 'stack' | 'row';
}

/** Create a price alert, edit the position and ask Pacu about the asset. */
export function AssetActions({ asset, layout }: AssetActionsProps) {
  const router = useRouter();
  const { ticker, canAlert } = asset.header;
  const withIcons = layout !== 'grid';
  const fullWidth = layout !== 'row';

  const alert = canAlert ? (
    <Button
      size="md"
      leftIcon={asset.kind === 'stock' ? 'bell' : 'bellAlert'}
      fullWidth={fullWidth}
      className="px-4.5"
      onPress={() => router.navigate({ pathname: '/new-price-alert', params: { ticker } })}
    >
      Criar alerta de preço
    </Button>
  ) : null;
  const edit = (
    <Button
      variant="secondary"
      size="md"
      leftIcon={withIcons ? 'pencil' : undefined}
      fullWidth={fullWidth}
      className={layout === 'grid' ? 'flex-1 px-2.5' : 'px-4.5'}
      onPress={() => router.navigate({ pathname: '/new-manual-asset', params: { ticker } })}
    >
      Editar posição
    </Button>
  );
  const ask = (
    <Button
      variant="secondary"
      size="md"
      leftIcon={withIcons ? 'message' : undefined}
      fullWidth={fullWidth}
      className={layout === 'grid' ? 'flex-1 px-2.5' : 'px-4.5'}
      onPress={() => router.navigate(conversationHref(undefined, { assistant: 'pacu' }))}
    >
      Perguntar ao Pacu
    </Button>
  );

  if (layout === 'grid') {
    return (
      <View className="gap-2">
        {alert}
        <View className="flex-row gap-2">
          {edit}
          {ask}
        </View>
      </View>
    );
  }
  return (
    <View className={layout === 'row' ? 'flex-row flex-wrap gap-2' : 'gap-2'}>
      {alert}
      {edit}
      {ask}
    </View>
  );
}
