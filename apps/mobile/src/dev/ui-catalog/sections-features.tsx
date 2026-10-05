import { cents } from '@guara/utils';
import { View } from 'react-native';

import { InfoNote, SelectPill } from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { DayHeader, SummaryTiles, TransactionRow } from '@/features/spending';

import { CatalogSection, Example } from './CatalogSection';

/** Pieces of the transaction lists (Lançamentos). */
export function LedgerSection() {
  return (
    <CatalogSection
      title="Lançamentos"
      note="SelectPill de filtro (36), DayHeader, TransactionRow, SummaryTiles e AssistantNote."
    >
      <Example label="SelectPill 36 · 44 · 48">
        <View className="flex-row flex-wrap items-center gap-2">
          <SelectPill size={36} icon="calendar" label="Setembro 2026" />
          <SelectPill size={44} icon="calendar" label="Set 2026" />
          <SelectPill label="Mensal" />
        </View>
      </Example>
      <SummaryTiles summary={{ count: 3, totalIn: cents(100_000), totalOut: cents(25_000) }} />
      <SummaryTiles summary={null} />
      <View>
        <DayHeader label="Hoje · 23 de setembro" total={cents(-125_940)} />
        <TransactionRow
          name="Loja exemplo"
          detail="02:14 · Banco crédito · Eletrônicos"
          amount={cents(-124_990)}
          flagged
          onPress={() => undefined}
        />
        <TransactionRow name="Café" detail="Banco crédito" amount={cents(-950)} duplicate />
        <TransactionRow name="Freela" detail="Pix recebido · Banco" amount={cents(100_000)} />
      </View>
      <AssistantNote assistant="tamandua">
        Nota curta de um assistente, gerada dos dados.
      </AssistantNote>
      <InfoNote icon="alertTriangle" tone="warning" size={13}>
        Um banco não atualizou desde 10:05.
      </InfoNote>
    </CatalogSection>
  );
}
