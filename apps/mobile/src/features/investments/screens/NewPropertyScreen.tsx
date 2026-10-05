import type { Cents, YearMonth } from '@guara/types';
import { cents, subtractCents } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid, SectionCard } from '@/components/layout';
import {
  Chip,
  DataRow,
  InfoNote,
  Input,
  MoneyInput,
  MoneyText,
  SegmentedControl,
  SelectField,
  Text,
} from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { PropertyPreview } from '../components';
import { useProperties } from '../hooks/useProperties';
import { addMonths, monthTitle, propertyValue } from '../lib/properties';
import {
  PROPERTIES_MONTH,
  REAL_ESTATE_TYPES,
  type RealEstate,
  type RealEstateType,
} from '../property-data';
import { useInvestmentsStore } from '../store';

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const month = addMonths(PROPERTIES_MONTH, -index);
  return { value: month, label: monthTitle(month) };
});

function Grid({ children }: { children: ReactNode }) {
  return (
    <ResponsiveGrid columns={{ tablet: 2 }} gap={14}>
      {children}
    </ResponsiveGrid>
  );
}

function Hint({ children }: { children: string }) {
  return (
    <Text size={13} tone="subtle" className="-mt-1">
      {children}
    </Text>
  );
}

/** "72 m²" → 72; empty or invalid → null. */
function parseArea(text: string): number | null {
  const digits = text.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

/** "Cadastrar imóvel" (and editing one: `?propertyId=`). */
export function NewPropertyScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { find, netWorth } = useProperties();
  const addProperty = useInvestmentsStore((state) => state.addProperty);
  const updateProperty = useInvestmentsStore((state) => state.updateProperty);
  const found = find(propertyId);
  const editing = found?.kind === 'realEstate' ? found : null;
  const latest = editing?.valuations[0] ?? null;

  const [name, setName] = useState(editing?.name ?? '');
  const [type, setType] = useState<RealEstateType>(editing?.type ?? 'apartment');
  const [area, setArea] = useState(editing?.area ? `${editing.area} m²` : '');
  const [city, setCity] = useState(editing?.city ?? '');
  const [value, setValue] = useState<Cents | null>(latest?.value ?? null);
  const [month, setMonth] = useState<YearMonth>(latest?.on ?? PROPERTIES_MONTH);
  const [financed, setFinanced] = useState(Boolean(editing?.financing));
  const [balance, setBalance] = useState<Cents | null>(editing?.financing?.balance ?? null);
  const [bank, setBank] = useState(editing?.financing?.bank ?? '');

  const today = editing ? subtractCents(netWorth, propertyValue(editing) ?? cents(0)) : netWorth;
  const valid = name.trim().length > 0 && Boolean(value) && (!financed || Boolean(balance));

  const submit = () => {
    if (!valid || !value) return;
    const financing =
      financed && balance
        ? {
            balance,
            informedOn:
              editing?.financing?.balance === balance ? editing.financing.informedOn : month,
            bank: bank.trim() || null,
          }
        : null;
    const valuations = editing
      ? latest && latest.value === value && latest.on === month
        ? editing.valuations
        : [
            { on: month, value, kind: 'estimate' as const },
            ...editing.valuations.filter((item) => item.on !== month),
          ].sort((a, b) => b.on.localeCompare(a.on))
      : [{ on: month, value, kind: 'registration' as const }];
    const property: Omit<RealEstate, 'id'> = {
      kind: 'realEstate',
      name: name.trim(),
      type,
      area: parseArea(area),
      city: city.trim() || null,
      valuations,
      financing,
    };
    if (editing) {
      updateProperty({ ...property, id: editing.id });
      toast.success('Imóvel atualizado');
      router.back();
      return;
    }
    const id = addProperty(property);
    toast.success('Imóvel cadastrado no patrimônio');
    router.replace({
      pathname: '/investments/properties/[propertyId]',
      params: { propertyId: id },
    });
  };

  const nameField = (
    <View className="gap-2">
      <Input
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Ex.: Apartamento em Pinheiros"
        helperText="Como ele vai aparecer na sua lista de bens"
      />
    </View>
  );
  const typeField = (
    <View className="gap-2">
      <Text size={14} weight="bold">
        Tipo
      </Text>
      <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
        {REAL_ESTATE_TYPES.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={type === item.key}
            appearance="filled"
            textSize={14}
            onPress={() => setType(item.key)}
          />
        ))}
      </View>
    </View>
  );
  const areaField = (
    <Input
      label="Área (opcional)"
      value={area}
      onChangeText={setArea}
      onBlur={() => {
        const parsed = parseArea(area);
        setArea(parsed ? `${parsed} m²` : '');
      }}
      keyboardType="number-pad"
      placeholder="Ex.: 72 m²"
    />
  );
  const cityField = (
    <Input
      label="Cidade (opcional)"
      value={city}
      onChangeText={setCity}
      placeholder="Ex.: São Paulo, SP"
    />
  );
  const valueField = (
    <MoneyInput
      label="Valor estimado"
      value={value}
      onChangeValue={setValue}
      size={64}
      display
      rounded="16"
      helperText="Quanto você acha que ele vale hoje. Pode ser uma estimativa."
    />
  );
  const monthField = (
    <View className="gap-2">
      <SelectField
        label="Data da estimativa"
        value={month}
        onChange={setMonth}
        options={MONTH_OPTIONS}
      />
      <Hint>Lembramos de atualizar a cada 6 meses</Hint>
    </View>
  );
  const financedField = (
    <View className="gap-2">
      <Text size={14} weight="bold">
        Está financiado?
      </Text>
      <SegmentedControl
        accessibilityLabel="Financiamento"
        track="input"
        size="sm"
        textSize={14}
        fill
        value={financed ? 'yes' : 'no'}
        onChange={(next) => setFinanced(next === 'yes')}
        options={[
          { value: 'no', label: 'Não, quitado' },
          { value: 'yes', label: 'Sim, financiado' },
        ]}
      />
    </View>
  );
  const balanceField = financed ? (
    <MoneyInput
      label="Saldo devedor"
      value={balance}
      onChangeValue={setBalance}
      helperText="O quanto falta pagar, conforme o último extrato do financiamento"
    />
  ) : null;
  const bankField = financed ? (
    <Input
      label="Banco do financiamento (opcional)"
      value={bank}
      onChangeText={setBank}
      placeholder="Ex.: banco ou cooperativa"
    />
  ) : null;

  const preview = (
    <PropertyPreview
      today={today}
      value={value}
      debtRow={
        financed ? (
          <DataRow
            label="Valor líquido, sem a dívida"
            value={
              value && balance ? (
                <MoneyText value={subtractCents(value, balance)} wholeUnits weight="semibold" />
              ) : (
                '—'
              )
            }
          />
        ) : (
          <DataRow label="Saldo devedor" value="— · quitado" />
        )
      }
    />
  );
  const note = (
    <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
      O Guará não busca valor de imóvel automaticamente. O valor é sempre o que você informar.
    </InfoNote>
  );

  return (
    <FormScreen
      title={editing ? 'Editar imóvel' : 'Cadastrar imóvel'}
      parents={
        editing
          ? [
              { label: 'Investimentos', href: '/investments' },
              {
                label: editing.name,
                href: {
                  pathname: '/investments/properties/[propertyId]',
                  params: { propertyId: editing.id },
                },
              },
            ]
          : [
              { label: 'Investimentos', href: '/investments' },
              { label: 'Adicionar', href: '/new-manual-asset' },
            ]
      }
      current={editing ? 'Editar' : 'Imóvel'}
      fallbackHref="/investments"
      submit={{
        label: editing ? 'Salvar alterações' : 'Salvar imóvel',
        icon: 'check',
        onPress: submit,
        disabled: !valid,
      }}
      contentClassName="gap-[18px] pt-2"
    >
      {isTablet ? (
        <>
          <SectionCard title="O imóvel" titleSize={17} padding={20}>
            <Grid>
              {nameField}
              {areaField}
              {cityField}
              <View />
            </Grid>
            {typeField}
          </SectionCard>
          <SectionCard title="Valor" titleSize={17} padding={20}>
            <Grid>
              {valueField}
              {monthField}
            </Grid>
          </SectionCard>
          <SectionCard title="Financiamento" titleSize={17} padding={20}>
            {financedField}
            {financed ? (
              <Grid>
                {balanceField}
                {bankField}
              </Grid>
            ) : null}
          </SectionCard>
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch={false}>
            {preview}
            {note}
          </ResponsiveGrid>
        </>
      ) : (
        <>
          {nameField}
          {typeField}
          {areaField}
          {cityField}
          {valueField}
          {monthField}
          {financedField}
          {balanceField}
          {bankField}
          {preview}
          {note}
        </>
      )}
    </FormScreen>
  );
}
