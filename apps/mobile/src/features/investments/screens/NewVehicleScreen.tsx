import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents, formatDate, subtractCents } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { toast } from '@/components/feedback';
import { FormScreen, ResponsiveGrid, SectionCard } from '@/components/layout';
import {
  Chip,
  DataRow,
  Icon,
  Input,
  MoneyInput,
  MoneyText,
  SearchInput,
  SegmentedControl,
  SelectField,
  Text,
} from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { PropertyPreview } from '../components';
import { useProperties } from '../hooks/useProperties';
import {
  fipeChange,
  fipeEntry,
  fipeModel,
  fipeYear,
  propertyValue,
  searchFipe,
  signedPercent,
} from '../lib/properties';
import {
  FIPE_TABLE,
  PROPERTIES_MONTH,
  VEHICLE_TYPES,
  type FipeEntry,
  type Vehicle,
  type VehicleType,
} from '../property-data';
import { useInvestmentsStore } from '../store';

function Grid({ children }: { children: ReactNode }) {
  return (
    <ResponsiveGrid columns={{ tablet: 2 }} gap={14}>
      {children}
    </ResponsiveGrid>
  );
}

/** Default name from the FIPE entry: "Onix LT 2022". */
function defaultName(entry: FipeEntry): string {
  return `${entry.model.split(' ').slice(0, 2).join(' ')} ${entry.year}`;
}

/** The chosen vehicle with its FIPE value (green box of the design). */
function FipeResult({ entry }: { entry: FipeEntry }) {
  const last = entry.history.at(-1)!;
  const previous = entry.history.at(-2);
  const change = fipeChange(entry, 1);
  return (
    <View
      accessible
      accessibilityLabel={`${fipeModel(entry)}, ${fipeYear(entry)}. Valor na Tabela FIPE: ${formatDate(`${last.month}-01`, 'MMMM/yyyy')}`}
      className="gap-2.5 rounded-18 border-2 border-positive bg-positive-muted p-4"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-12 bg-positive-muted">
          <Icon name="car" size={20} color={colors.positive.DEFAULT} />
        </View>
        <View className="min-w-0 flex-1">
          <Text weight="bold" leading={1.35}>
            {fipeModel(entry)}
          </Text>
          <Text size={13} tone="muted" leading={1.35}>
            {fipeYear(entry)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-baseline justify-between gap-2">
        <Text size={13} tone="muted" className="min-w-0 flex-shrink">
          {`Valor na Tabela FIPE de ${formatDate(`${last.month}-01`, 'MMMM/yyyy')}`}
        </Text>
        <MoneyText
          value={last.value}
          wholeUnits
          serif
          weight="extrabold"
          size={24}
          leading={1.1}
          tracking={-0.01}
        />
      </View>
      <Text size={13} tone="muted">
        {change && previous
          ? `${signedPercent(change.percent)} em relação a ${formatDate(`${previous.month}-01`, 'MMMM')} · atualizado todo mês, sozinho`
          : 'Atualizado todo mês, sozinho'}
      </Text>
    </View>
  );
}

/** "Cadastrar veículo" (and editing one: `?propertyId=`): value from the Tabela FIPE. */
export function NewVehicleScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const { find, netWorth } = useProperties();
  const addProperty = useInvestmentsStore((state) => state.addProperty);
  const updateProperty = useInvestmentsStore((state) => state.updateProperty);
  const found = find(propertyId);
  const editing = found?.kind === 'vehicle' ? found : null;
  const editingEntry = editing ? fipeEntry(editing.fipeCode) : null;

  const [query, setQuery] = useState('');
  const [type, setType] = useState<VehicleType>(editingEntry?.type ?? 'car');
  const [code, setCode] = useState<string | null>(editingEntry?.code ?? null);
  const [name, setName] = useState(editing?.name ?? '');
  const [financed, setFinanced] = useState(Boolean(editing?.financing));
  const [balance, setBalance] = useState<Cents | null>(editing?.financing?.balance ?? null);
  const [plate, setPlate] = useState(editing?.plate ?? '');

  const entry = code ? fipeEntry(code) : null;
  const ofType = FIPE_TABLE.filter((item) => item.type === type);
  const brands = [...new Set(ofType.map((item) => item.brand))];
  const models = ofType.filter((item) => item.brand === entry?.brand);
  const results = searchFipe(query);
  const value = entry?.history.at(-1)?.value ?? null;
  const today = editing ? subtractCents(netWorth, propertyValue(editing) ?? cents(0)) : netWorth;
  const valid = Boolean(entry) && name.trim().length > 0 && (!financed || Boolean(balance));

  const choose = (next: FipeEntry | null) => {
    setCode(next?.code ?? null);
    if (next && !name.trim()) setName(defaultName(next));
  };

  const submit = () => {
    if (!valid || !entry) return;
    const property: Omit<Vehicle, 'id'> = {
      kind: 'vehicle',
      name: name.trim(),
      fipeCode: entry.code,
      plate: plate.trim().toUpperCase() || null,
      financing:
        financed && balance
          ? {
              balance,
              informedOn:
                editing?.financing?.balance === balance
                  ? editing.financing.informedOn
                  : PROPERTIES_MONTH,
              bank: editing?.financing?.bank ?? null,
            }
          : null,
    };
    if (editing) {
      updateProperty({ ...property, id: editing.id });
      toast.success('Veículo atualizado');
      router.back();
      return;
    }
    const id = addProperty(property);
    toast.success('Veículo cadastrado no patrimônio');
    router.replace({
      pathname: '/investments/properties/[propertyId]',
      params: { propertyId: id },
    });
  };

  const search = (
    <View className="gap-2">
      <SearchInput
        size={46}
        value={query}
        onChangeText={setQuery}
        placeholder={isTablet ? 'Ex.: Onix 2022' : 'Buscar na Tabela FIPE: marca, modelo ou ano'}
        accessibilityLabel="Buscar na Tabela FIPE: marca, modelo ou ano"
      />
      {query.trim() ? (
        results.length > 0 ? (
          <View className="overflow-hidden rounded-16 border border-border">
            {results.map((item) => (
              <Pressable
                key={item.code}
                accessibilityRole="button"
                accessibilityLabel={`${fipeModel(item)}, ${fipeYear(item)}`}
                onPress={() => {
                  setType(item.type);
                  choose(item);
                  setQuery('');
                }}
                className="min-h-12 justify-center bg-surface-input px-4 py-2.5 active:bg-surface-pressed"
              >
                <Text weight="semibold">{fipeModel(item)}</Text>
                <Text size={13} tone="muted">
                  {fipeYear(item)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text size={13} tone="subtle">
            Nenhum veículo com esse nome na Tabela FIPE. Escolha marca, modelo e ano abaixo.
          </Text>
        )
      ) : null}
    </View>
  );
  const typeField = (
    <View className="gap-2">
      <Text size={14} weight="bold">
        Tipo
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {VEHICLE_TYPES.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={type === item.key}
            appearance="filled"
            textSize={14}
            onPress={() => {
              setType(item.key);
              if (entry && entry.type !== item.key) choose(null);
            }}
          />
        ))}
      </View>
    </View>
  );
  const none = { value: '', label: 'Escolha' };
  const brandField = (
    <SelectField
      label="Marca"
      value={entry?.brand ?? ''}
      onChange={(brand) => choose(ofType.find((item) => item.brand === brand) ?? null)}
      options={brands.length > 0 ? brands.map((brand) => ({ value: brand, label: brand })) : [none]}
    />
  );
  const modelField = (
    <SelectField
      label="Modelo"
      value={entry?.model ?? ''}
      onChange={(model) => choose(models.find((item) => item.model === model) ?? null)}
      options={
        models.length > 0
          ? models.map((item) => ({ value: item.model, label: item.model }))
          : [none]
      }
    />
  );
  const yearField = (
    <SelectField
      label="Ano e combustível"
      value={entry?.code ?? ''}
      onChange={(next) => choose(fipeEntry(next))}
      options={
        entry
          ? models
              .filter((item) => item.model === entry.model)
              .map((item) => ({ value: item.code, label: fipeYear(item) }))
          : [none]
      }
    />
  );
  const result = entry ? <FipeResult entry={entry} /> : null;
  const nameField = (
    <Input
      label="Nome"
      value={name}
      onChangeText={setName}
      placeholder="Ex.: Onix LT 2022"
      helperText="Como ele vai aparecer na sua lista de bens"
    />
  );
  const statusField = (
    <View className="gap-2">
      <Text size={14} weight="bold">
        Situação
      </Text>
      <SegmentedControl
        accessibilityLabel="Situação"
        track="input"
        size="sm"
        textSize={14}
        fill
        value={financed ? 'financed' : 'paid'}
        onChange={(next) => setFinanced(next === 'financed')}
        options={[
          { value: 'paid', label: 'Quitado' },
          { value: 'financed', label: 'Financiado' },
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
  const plateField = (
    <Input
      label="Placa (opcional, só para você identificar)"
      value={plate}
      onChangeText={setPlate}
      autoCapitalize="characters"
      autoCorrect={false}
      maxLength={7}
      placeholder="ABC1D23"
    />
  );
  const preview = (
    <PropertyPreview
      today={today}
      value={value}
      debtRow={
        <DataRow
          label="Saldo devedor"
          value={
            financed ? (
              balance ? (
                <MoneyText value={balance} wholeUnits weight="semibold" />
              ) : (
                '—'
              )
            ) : (
              '— · quitado'
            )
          }
        />
      }
    />
  );

  return (
    <FormScreen
      title={editing ? 'Editar veículo' : 'Cadastrar veículo'}
      parents={[
        { label: 'Investimentos', href: '/investments' },
        editing
          ? {
              label: editing.name,
              href: {
                pathname: '/investments/properties/[propertyId]',
                params: { propertyId: editing.id },
              },
            }
          : { label: 'Adicionar', href: '/new-manual-asset' },
      ]}
      current={editing ? 'Editar' : 'Veículo'}
      fallbackHref="/investments"
      submit={{
        label: editing ? 'Salvar alterações' : 'Salvar veículo',
        icon: 'check',
        onPress: submit,
        disabled: !valid,
      }}
      contentClassName="gap-[18px] pt-2"
    >
      {isTablet ? (
        <>
          <SectionCard
            title="Buscar na Tabela FIPE"
            description="Escolha marca, modelo e ano"
            titleSize={17}
            padding={20}
          >
            {search}
            {typeField}
            <Grid>
              {brandField}
              {modelField}
              {yearField}
              <View />
            </Grid>
            {result}
          </SectionCard>
          <SectionCard title="Detalhes" titleSize={17} padding={20}>
            <Grid>
              {nameField}
              {statusField}
              {plateField}
              {balanceField ?? <View />}
            </Grid>
          </SectionCard>
          {preview}
        </>
      ) : (
        <>
          {search}
          {typeField}
          {brandField}
          {modelField}
          {yearField}
          {result}
          {nameField}
          {statusField}
          {balanceField}
          {plateField}
          {preview}
        </>
      )}
    </FormScreen>
  );
}
