import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { Icon, LinkButton, MoneyText, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { useProperties } from '../hooks/useProperties';
import { propertyDetail, propertySource, propertyValue, wholeReais } from '../lib/properties';

/** "Imóveis e outros bens": real estate and vehicles in the net worth. */
export function PropertiesCard() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { properties, total } = useProperties();
  return (
    <SectionCard
      title={isTablet ? 'Imóveis, veículos e outros bens' : 'Imóveis e outros bens'}
      description={
        properties.length > 0 ? `Somam ${wholeReais(total)} no patrimônio` : 'Nenhum bem cadastrado'
      }
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 20 : 16}
      gap={isTablet ? 12 : 8}
      action={
        <LinkButton
          label="Novo"
          accessibilityLabel="Adicionar bem"
          className="min-h-6"
          onPress={() => router.navigate('/new-manual-asset')}
        />
      }
    >
      <View>
        {properties.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="link"
            accessibilityLabel={`${item.name}, ${propertyDetail(item)}`}
            onPress={() =>
              router.navigate({
                pathname: '/investments/properties/[propertyId]',
                params: { propertyId: item.id },
              })
            }
            className="flex-row items-start gap-3 border-b border-border py-3 active:opacity-80"
          >
            <View className="h-10 w-10 items-center justify-center rounded-12 bg-surface-muted">
              <Icon
                name={item.kind === 'realEstate' ? 'home' : 'car'}
                size={20}
                color={colors.brand.DEFAULT}
              />
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <View className="flex-row items-baseline justify-between gap-2">
                <Text size={15} weight="bold" leading={1.35} className="min-w-0 flex-shrink">
                  {item.name}
                </Text>
                <MoneyText value={propertyValue(item)} wholeUnits size={15} weight="bold" />
              </View>
              <Text size={13} tone="muted" leading={1.35}>
                {propertyDetail(item)}
              </Text>
              <Text size={12} tone="subtle" leading={1.35}>
                {propertySource(item)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Text variant="caption" tone="muted">
        Bens não entram na alocação do seu perfil. Veículos seguem a Tabela FIPE; imóveis, o valor
        que você informar.
      </Text>
    </SectionCard>
  );
}
