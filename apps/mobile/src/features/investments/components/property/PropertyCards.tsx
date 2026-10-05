import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { cents, formatCents, formatDate } from '@guara/utils';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { TrendAreaChart } from '@/components/charts';
import { MataSurface } from '@/components/illustrations';
import { SectionCard } from '@/components/layout';
import { DataRow, Icon, InfoNote, MoneyText, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { PORTFOLIO } from '../../data';
import type { FipeEntry, RealEstate, Vehicle } from '../../property-data';
import {
  fipeChange,
  fipeModel,
  fipeYear,
  monthText,
  monthTitle,
  netValue,
  nextReview,
  ownedShare,
  realEstateSummary,
  shareOfTotal,
  shortMonthText,
  signedPercent,
  thousandsLabel,
  valuationRows,
  vehicleSummary,
  wholeReais,
} from '../../lib/properties';

export interface PropertyHeroProps {
  icon: 'building' | 'car';
  summary: string;
  name: string;
  valueLabel: string;
  value: Cents | null;
  caption: string;
  actions: ReactNode;
}

/** Mata card on top of a property: what it is, its value and the main actions. */
export function PropertyHero({
  icon,
  summary,
  name,
  valueLabel,
  value,
  caption,
  actions,
}: PropertyHeroProps) {
  return (
    <MataSurface
      veil={[0.85, 0.55, 0.1]}
      className="gap-2 rounded-24 border border-border-strong bg-hero p-5"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-12 bg-positive-muted">
          <Icon name={icon} size={22} color={colors.positive.DEFAULT} />
        </View>
        <View className="min-w-0 flex-1">
          <Text size={14} leading={1.3} style={{ color: colors.hero.label }}>
            {summary}
          </Text>
          <Text size={18} weight="bold" leading={1.3}>
            {name}
          </Text>
        </View>
      </View>
      <Text size={14} style={{ color: colors.hero.label }}>
        {valueLabel}
      </Text>
      <MoneyText
        value={value}
        wholeUnits
        serif
        weight="extrabold"
        size={36}
        leading={1.1}
        tracking={-0.01}
      />
      <Text size={14} leading={1.5} style={{ color: colors.hero.caption }}>
        {caption}
      </Text>
      <View className="mt-1 flex-row flex-wrap items-center gap-2">{actions}</View>
    </MataSurface>
  );
}

/** Hero texts of a real estate. */
export function realEstateHero(property: RealEstate) {
  const latest = property.valuations[0];
  const review = nextReview(property);
  return {
    summary: realEstateSummary(property),
    valueLabel: 'Valor estimado por você',
    caption: latest
      ? `Atualizado em ${monthText(latest.on)}${review ? ` · próxima revisão em ${monthText(review)}` : ''}`
      : 'Informe quanto ele vale para entrar no patrimônio.',
  };
}

/** Hero texts of a vehicle. */
export function vehicleHero(property: Vehicle, entry: FipeEntry | null) {
  const last = entry?.history.at(-1);
  const previous = entry?.history.at(-2);
  const change = entry ? fipeChange(entry, 1) : null;
  return {
    summary: vehicleSummary(property),
    valueLabel: last
      ? `Tabela FIPE de ${formatDate(`${last.month}-01`, 'MMMM/yyyy')}`
      : 'Fora da Tabela FIPE',
    caption:
      change && previous
        ? `${formatCents(change.amount, { wholeUnits: true, typographicMinus: true, signDisplay: 'always' })} (${signedPercent(change.percent)}) em relação a ${formatDate(`${previous.month}-01`, 'MMMM')}`
        : 'O valor segue a Tabela FIPE e é atualizado todo mês.',
  };
}

function ValueTile({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: Cents | null;
  caption: string;
  tone: 'negative' | 'positive';
}) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5">
      <Text size={13} tone="subtle">
        {label}
      </Text>
      <MoneyText value={value} wholeUnits serif weight="bold" size={19} tone={tone} />
      <Text size={12} tone="muted">
        {caption}
      </Text>
    </View>
  );
}

/** "Financiamento": debt, net value and how much is already paid. */
export function FinancingCard({ property }: { property: RealEstate | Vehicle }) {
  const { isTablet } = useBreakpoint();
  const financing = property.financing;
  if (!financing) return null;
  const owned = ownedShare(property);
  return (
    <SectionCard title="Financiamento" titleSize={isTablet ? 19 : 17} padding={18}>
      <View className="flex-row gap-2.5">
        <ValueTile
          label="Saldo devedor"
          value={financing.balance}
          caption={`informado em ${shortMonthText(financing.informedOn)}`}
          tone="negative"
        />
        <ValueTile
          label="Valor líquido"
          value={netValue(property)}
          caption="valor menos a dívida"
          tone="positive"
        />
      </View>
      {owned !== null ? (
        <View className="gap-1.5" accessible accessibilityLabel={`Já é seu: ${owned}% do valor`}>
          <View className="flex-row justify-between">
            <Text size={13} tone="muted">
              Já é seu
            </Text>
            <Text size={13} weight="bold">
              {`${owned}%`}
            </Text>
          </View>
          <View className="h-2.5 overflow-hidden rounded-[5px] bg-surface-muted">
            <View
              className="h-2.5 rounded-[5px] bg-positive"
              style={{ width: `${Math.max(0, Math.min(100, owned))}%` }}
            />
          </View>
        </View>
      ) : null}
      <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
        O saldo devedor não atualiza sozinho. Quando chegar o extrato do financiamento, toque em
        “Atualizar saldo”.
      </InfoNote>
    </SectionCard>
  );
}

/** "Histórico de valor": the estimates the user informed. */
export function ValuationHistoryCard({ property }: { property: RealEstate }) {
  const { isTablet } = useBreakpoint();
  const rows = valuationRows(property);
  return (
    <SectionCard
      title="Histórico de valor"
      description="Estimativas que você informou"
      titleSize={isTablet ? 19 : 17}
      padding={18}
    >
      <View>
        {rows.map((row, index) => (
          <View
            key={row.on}
            accessible
            accessibilityLabel={`${monthTitle(row.on)}, ${row.label}: ${wholeReais(row.value)}${row.change === null ? '' : `, ${signedPercent(row.change)}`}`}
            className={cn(
              'flex-row items-center gap-3 py-3',
              index < rows.length - 1 && 'border-b border-border',
            )}
          >
            <View className="min-w-0 flex-1">
              <Text weight="medium" leading={1.35}>
                {monthTitle(row.on)}
              </Text>
              <Text size={12} tone="subtle" leading={1.35}>
                {row.label}
              </Text>
            </View>
            <View className="items-end">
              <MoneyText value={row.value} wholeUnits weight="bold" leading={1.35} />
              {row.change === null ? null : (
                <Text size={12} tone="subtle" leading={1.35}>
                  {signedPercent(row.change)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

/** "No seu patrimônio": net worth, the share of this asset and the profile allocation. */
export function PropertyNetWorthCard({
  label,
  value,
  netWorth,
}: {
  /** "Este imóvel", "Este veículo". */
  label: string;
  value: Cents | null;
  netWorth: Cents;
}) {
  const { isTablet } = useBreakpoint();
  return (
    <SectionCard title="No seu patrimônio" titleSize={isTablet ? 19 : 17} padding={18} gap={4}>
      <View>
        <DataRow
          label="Patrimônio total"
          value={<MoneyText value={netWorth} weight="semibold" />}
        />
        <DataRow label={label} value={shareOfTotal(value, netWorth)} />
        <DataRow label="Alocação do perfil" value="não entra" />
      </View>
    </SectionCard>
  );
}

/** "Dados do veículo". */
export function VehicleDataCard({
  property,
  entry,
}: {
  property: Vehicle;
  entry: FipeEntry | null;
}) {
  const { isTablet } = useBreakpoint();
  return (
    <SectionCard title="Dados do veículo" titleSize={isTablet ? 19 : 17} padding={18} gap={4}>
      <View>
        <DataRow label="Marca e modelo" value={entry ? fipeModel(entry) : '—'} />
        <DataRow label="Ano e combustível" value={entry ? fipeYear(entry) : '—'} />
        <DataRow label="Situação" value={property.financing ? 'Financiado' : 'Quitado'} />
        <DataRow label="Placa" value={property.plate ?? '—'} />
        <DataRow label="Atualização" value="Automática, todo mês pela FIPE" />
      </View>
    </SectionCard>
  );
}

/** "Valor na Tabela FIPE": the last months and how much the car lost. */
export function FipeCard({ name, entry }: { name: string; entry: FipeEntry }) {
  const { isTablet } = useBreakpoint();
  const history = entry.history;
  const first = history[0]!;
  const last = history.at(-1)!;
  const change = fipeChange(entry, history.length - 1);
  const month = (value: string) => formatDate(`${value}-01`, 'MMMM');
  let note = '';
  if (change && change.amount < 0) {
    note = `Carros perdem valor com o tempo. Em ${history.length} meses, a queda foi de ${wholeReais(cents(-change.amount))} (${signedPercent(change.percent)}).`;
  } else if (change) {
    note = `Em ${history.length} meses, o valor subiu ${wholeReais(change.amount)} (${signedPercent(change.percent)}).`;
  }
  return (
    <SectionCard
      title="Valor na Tabela FIPE"
      description={`Últimos ${history.length} meses`}
      titleSize={isTablet ? 19 : 17}
      padding={18}
    >
      <TrendAreaChart
        values={history.map((item) => item.value / 100)}
        xLabels={history.map((item) => formatDate(`${item.month}-01`, 'MMM'))}
        step={2000}
        formatTick={(value) => thousandsLabel(cents(Math.round(value * 100)))}
        accessibilityLabel={`Valor FIPE do ${name}: ${wholeReais(first.value)} em ${month(first.month)} a ${wholeReais(last.value)} em ${month(last.month)}`}
      />
      {note ? (
        <Text size={13} leading={1.55} tone="subtle">
          {note}
        </Text>
      ) : null}
    </SectionCard>
  );
}

/** "Alocação do perfil Moderado" (bens never enter the profile allocation). */
export const PROFILE_ALLOCATION_LABEL = `Alocação do perfil ${PORTFOLIO.profile}`;
