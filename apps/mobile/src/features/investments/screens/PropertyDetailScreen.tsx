import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { EmptyState, toast } from '@/components/feedback';
import { PageHeader, ResponsiveGrid, Screen, TopBar } from '@/components/layout';
import { Button, ConfirmDialog, IconButton, LinkButton } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';
import { ChatFab } from '@/navigation';

import {
  FinancingCard,
  FipeCard,
  PropertyHero,
  PropertyMenuSheet,
  PropertyNetWorthCard,
  UpdateDebtSheet,
  UpdateValueSheet,
  ValuationHistoryCard,
  VehicleDataCard,
  realEstateHero,
  vehicleHero,
  type PropertyMenuItem,
} from '../components';
import { useProperties } from '../hooks/useProperties';
import { fipeEntry, propertyValue } from '../lib/properties';
import { PROPERTIES_MONTH } from '../property-data';
import { useInvestmentsStore } from '../store';

type Dialog = 'menu' | 'value' | 'debt' | 'delete' | 'sold' | null;

/** "Bem": a real estate (estimated by the user) or a vehicle (Tabela FIPE). */
export function PropertyDetailScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { find, netWorth } = useProperties();
  const addValuation = useInvestmentsStore((state) => state.addValuation);
  const setFinancing = useInvestmentsStore((state) => state.setFinancing);
  const removeProperty = useInvestmentsStore((state) => state.removeProperty);
  const [dialog, setDialog] = useState<Dialog>(null);
  const property = find(propertyId);
  const close = () => setDialog(null);
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/investments'));

  if (!property) {
    return (
      <Screen header={isTablet ? null : <TopBar title="Bem" fallbackHref="/investments" />}>
        <EmptyState
          icon="search"
          title="Bem não encontrado"
          description="Ele pode ter sido excluído ou vendido."
          action={{ label: 'Ver investimentos', onPress: () => router.replace('/investments') }}
        />
      </Screen>
    );
  }

  const value = propertyValue(property);
  const edit = () =>
    router.navigate({
      pathname: property.kind === 'realEstate' ? '/new-property' : '/new-vehicle',
      params: { propertyId: property.id },
    });
  const open = (next: Dialog) => {
    haptics.selection();
    setDialog(next);
  };
  const actionButton = (
    label: string,
    icon: 'retry' | 'pencil' | 'tag',
    onPress: () => void,
    ghost = false,
  ) => (
    <Button
      key={label}
      variant={ghost ? 'ghost' : 'secondary'}
      size="md"
      leftIcon={icon}
      className="h-10 px-4.5"
      onPress={onPress}
    >
      {label}
    </Button>
  );

  let hero: ReactNode;
  let cards: ReactNode[];
  let menu: PropertyMenuItem[];
  const remove: PropertyMenuItem = {
    key: 'delete',
    label: 'Excluir bem',
    icon: 'trash',
    destructive: true,
    onPress: () => setDialog('delete'),
  };

  if (property.kind === 'realEstate') {
    const texts = realEstateHero(property);
    hero = (
      <PropertyHero
        icon="building"
        name={property.name}
        value={value}
        {...texts}
        actions={[
          actionButton('Atualizar valor', 'retry', () => open('value')),
          property.financing ? actionButton('Atualizar saldo', 'pencil', () => open('debt')) : null,
          actionButton('Editar', 'pencil', edit, true),
        ]}
      />
    );
    const financing = <FinancingCard key="financing" property={property} />;
    const history = <ValuationHistoryCard key="history" property={property} />;
    const netWorthCard = (
      <PropertyNetWorthCard key="net-worth" label="Este imóvel" value={value} netWorth={netWorth} />
    );
    cards = isTablet
      ? [property.financing ? financing : null, netWorthCard, history]
      : [financing, history, netWorthCard];
    menu = [
      { key: 'value', label: 'Atualizar valor', icon: 'retry', onPress: () => setDialog('value') },
      ...(property.financing
        ? [
            {
              key: 'debt',
              label: 'Atualizar saldo',
              icon: 'pencil' as const,
              onPress: () => setDialog('debt'),
            },
          ]
        : []),
      { key: 'edit', label: 'Editar', icon: 'pencil', onPress: edit },
      remove,
    ];
  } else {
    const entry = fipeEntry(property.fipeCode);
    hero = (
      <PropertyHero
        icon="car"
        name={property.name}
        value={value}
        {...vehicleHero(property, entry)}
        actions={[
          actionButton('Editar', 'pencil', edit),
          actionButton('Marcar como vendido', 'tag', () => open('sold'), true),
        ]}
      />
    );
    const fipe = entry ? <FipeCard key="fipe" name={property.name} entry={entry} /> : null;
    const data = <VehicleDataCard key="data" property={property} entry={entry} />;
    const netWorthCard = (
      <PropertyNetWorthCard
        key="net-worth"
        label="Este veículo"
        value={value}
        netWorth={netWorth}
      />
    );
    cards = isTablet ? [fipe, netWorthCard, data] : [fipe, data, netWorthCard];
    menu = [
      { key: 'edit', label: 'Editar', icon: 'pencil', onPress: edit },
      {
        key: 'sold',
        label: 'Marcar como vendido',
        icon: 'tag',
        onPress: () => setDialog('sold'),
      },
      remove,
    ];
  }

  const more = (
    <IconButton
      icon="moreHorizontal"
      accessibilityLabel="Mais opções do bem"
      onPress={() => open('menu')}
    />
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar title={property.name} fallbackHref="/investments" actions={more} />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title={property.name}
            breadcrumb={{
              parents: [
                { label: 'Investimentos', href: '/investments' },
                { label: 'Bens', href: '/investments' },
              ],
              current: property.name,
            }}
            actions={more}
          />
        ) : null}
        {hero}
        {isTablet ? (
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch={false}>
            {cards.filter(Boolean)}
          </ResponsiveGrid>
        ) : (
          cards
        )}
        <LinkButton
          label="Excluir bem"
          chevron={false}
          className="self-start"
          onPress={() => open('delete')}
        />
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <PropertyMenuSheet open={dialog === 'menu'} onClose={close} items={menu} />
      {property.kind === 'realEstate' ? (
        <UpdateValueSheet
          key={`value-${value}`}
          open={dialog === 'value'}
          current={value}
          onClose={close}
          onSave={(next, on) => {
            addValuation(property.id, next, on);
            toast.success('Valor atualizado');
          }}
        />
      ) : null}
      {property.financing ? (
        <UpdateDebtSheet
          key={`debt-${property.financing.balance}`}
          open={dialog === 'debt'}
          current={property.financing.balance}
          onClose={close}
          onSave={(balance) => {
            setFinancing(property.id, {
              ...property.financing!,
              balance,
              informedOn: PROPERTIES_MONTH,
            });
            toast.success('Saldo devedor atualizado');
          }}
          onPaidOff={() => {
            setFinancing(property.id, null);
            toast.success(`${property.name} marcado como quitado`);
          }}
        />
      ) : null}
      <ConfirmDialog
        open={dialog === 'delete'}
        title="Excluir bem?"
        message={`“${property.name}” sai do seu patrimônio. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onCancel={close}
        onConfirm={() => {
          close();
          removeProperty(property.id);
          toast.success('Bem excluído');
          leave();
        }}
      />
      <ConfirmDialog
        open={dialog === 'sold'}
        title="Marcar como vendido?"
        message={`“${property.name}” sai do seu patrimônio a partir de agora.`}
        confirmLabel="Marcar como vendido"
        onCancel={close}
        onConfirm={() => {
          close();
          removeProperty(property.id);
          toast.success(`${property.name} marcado como vendido`);
          leave();
        }}
      />
    </View>
  );
}
