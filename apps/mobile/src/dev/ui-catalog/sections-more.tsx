import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { View } from 'react-native';

import {
  BarChart,
  COUNTRY_CENTERS,
  InteractiveGlobe,
  LegendSwatch,
  ProjectionChart,
  RangeBar,
} from '@/components/charts';
import { EmptyState, ErrorState, toast } from '@/components/feedback';
import { ResponsiveGrid, SectionCard } from '@/components/layout';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  ConfirmDialog,
  CountBadge,
  DataRow,
  DataTable,
  Disclosure,
  InfoNote,
  InfoTip,
  ListItem,
  ProgressBar,
  RadioGroup,
  SegmentedControl,
  SelectField,
  Sheet,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Text,
  UnderlineTabs,
} from '@/components/ui';

import { CatalogSection, Example } from './CatalogSection';

export function SelectionSection() {
  const [chip, setChip] = useState('Mês');
  const [segment, setSegment] = useState<'all' | 'banks'>('all');
  const [tab, setTab] = useState<'1M' | '1A'>('1A');
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(false);
  const [radio, setRadio] = useState<'buy' | 'sell'>('sell');
  const [select, setSelect] = useState<'sep' | 'aug'>('sep');
  const [slider, setSlider] = useState(25);

  return (
    <CatalogSection
      title="Seleção"
      note="Chip, SegmentedControl, UnderlineTabs, Checkbox, Switch, RadioGroup, SelectField e Slider."
    >
      <View className="flex-row flex-wrap gap-2">
        {['Mês', 'Ano', '12M'].map((label) => (
          <Chip
            key={label}
            label={label}
            selected={chip === label}
            onPress={() => setChip(label)}
          />
        ))}
      </View>
      <SegmentedControl
        options={[
          { value: 'all', label: 'Tudo junto' },
          { value: 'banks', label: 'Por banco' },
        ]}
        value={segment}
        onChange={setSegment}
      />
      <UnderlineTabs
        options={[
          { value: '1M', label: '1M' },
          { value: '1A', label: '1A' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <Checkbox label="Notificação no celular" checked={checked} onChange={setChecked} />
      <Switch
        label="Reduzir animações"
        description="Vale para o app todo"
        value={switched}
        onValueChange={setSwitched}
      />
      <RadioGroup
        accessibilityLabel="Tipo de alerta"
        options={[
          { value: 'buy', label: 'Compra', description: 'Quando cair' },
          { value: 'sell', label: 'Venda', description: 'Quando subir' },
        ]}
        value={radio}
        onChange={setRadio}
      />
      <SelectField
        label="Mês"
        options={[
          { value: 'sep', label: 'Setembro' },
          { value: 'aug', label: 'Agosto' },
        ]}
        value={select}
        onChange={setSelect}
      />
      <Example label={`Slider: ${slider} anos`}>
        <Slider
          value={slider}
          min={5}
          max={45}
          step={1}
          onChange={setSlider}
          accessibilityLabel="Prazo"
          valueText={`${slider} anos`}
        />
      </Example>
    </CatalogSection>
  );
}

export function DisplaySection() {
  return (
    <CatalogSection
      title="Exibição"
      note="Badge, CountBadge, Avatar, ProgressBar, InfoNote, InfoTip, DataRow, DataTable e Disclosure."
    >
      <View className="flex-row flex-wrap gap-2">
        {(['neutral', 'positive', 'negative', 'warning', 'info', 'brand'] as const).map((tone) => (
          <Badge key={tone} label={tone} tone={tone} />
        ))}
        <Badge label="status" tone="positive" appearance="status" />
        <Badge label="solid" tone="brand" appearance="solid" />
      </View>
      <View className="flex-row items-center gap-3">
        <Avatar name="Arthur Rocha" tone="brand" />
        <Avatar name="Bia" tone="neutral" size={32} />
        <CountBadge count={2} accessibilityLabel="2 alertas" />
      </View>
      <ProgressBar percent={74} tone="warning" marker={70} accessibilityLabel="74% do teto" />
      <InfoNote icon="info">Explicação curta com ícone.</InfoNote>
      <InfoNote icon="alertTriangle" tone="warning">
        Aviso em destaque.
      </InfoNote>
      <View className="flex-row items-center">
        <Text>Com dica</Text>
        <InfoTip text="Toque para ver a explicação." />
      </View>
      <View>
        <DataRow label="Quantidade" value="200 ações" density="compact" />
        <DataRow label="Classe" value="Renda variável" info="Grupo usado na sua alocação." />
        <DataRow label="Nome" value="iShares Ibovespa Fundo de Índice" layout="stacked" last />
      </View>
      <DataTable
        caption="Exemplo de tabela"
        columns={[
          { key: 'date', label: 'Data' },
          { key: 'value', label: 'Valor', align: 'right' },
        ]}
        rows={[
          { key: '1', cells: [<Text key="d">20/08/2026</Text>, <Text key="v">R$ 0,72</Text>] },
          { key: '2', cells: [<Text key="d">20/05/2026</Text>, <Text key="v">R$ 0,64</Text>] },
        ]}
      />
      <Disclosure title="Como calculamos">
        <Text tone="muted">Conteúdo que abre e fecha.</Text>
      </Disclosure>
    </CatalogSection>
  );
}

function GlobeExample() {
  const [selected, setSelected] = useState<string | null>(null);
  const [lat = 0, lon = 0] = COUNTRY_CENTERS[392] ?? [];
  return (
    <Example label={`InteractiveGlobe (Japão em destaque) · selecionado: ${selected ?? 'nenhum'}`}>
      <InteractiveGlobe
        markers={[
          { key: 'JP', label: 'Japão', lat, lon, color: colors.negative.DEFAULT, countryId: 392 },
        ]}
        orbit={{ key: 'crypto', label: 'Sem país', color: colors.positive.DEFAULT }}
        selectedKey={selected}
        onSelect={setSelected}
        initialCenter={{ lat: 20, lon: 120 }}
        maxSize={240}
        accessibilityLabel="Globo de exemplo"
      />
    </Example>
  );
}

export function ChartsSection() {
  return (
    <CatalogSection
      title="Gráficos"
      note="SVG com a geometria do design; toque nos pontos para ver o valor."
    >
      <GlobeExample />
      <RangeBar
        position={62}
        minLabel="Mín. R$ 30,12"
        maxLabel="Máx. R$ 42,50"
        accessibilityLabel="Faixa de 52 semanas"
      />
      <BarChart
        data={[0.95, 1.12, 0.74, 0.72].map((value, index) => ({
          label: `p${index + 1}`,
          value,
          highlight: index === 3,
          description: `R$ ${value.toFixed(2).replace('.', ',')}`,
        }))}
        maxValue={1.2}
        ticks={[
          { value: 0, label: '0' },
          { value: 1, label: '1' },
        ]}
        color={colors.positive.DEFAULT}
        accessibilityLabel="Barras de exemplo"
      />
      <ProjectionChart
        values={[0, 10, 22, 36, 52, 70]}
        contributed={[0, 9, 18, 27, 36, 45]}
        goal={{ value: 70, label: 'Meta' }}
        xLabels={['hoje', '5 anos']}
        accessibilityLabel="Projeção de exemplo"
      />
      <View className="flex-row gap-4">
        <LegendSwatch label="Linha" color={colors.info.DEFAULT} />
        <LegendSwatch label="Tracejada" dashed />
        <LegendSwatch label="Ponto" shape="dot" color={colors.brand.DEFAULT} />
      </View>
    </CatalogSection>
  );
}

export function FeedbackSection() {
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  return (
    <CatalogSection
      title="Feedback"
      note="Toast, Sheet, ConfirmDialog, Skeleton, Spinner, EmptyState e ErrorState."
    >
      <View className="flex-row flex-wrap gap-2">
        <Button size="sm" variant="secondary" onPress={() => toast.success('Salvo')}>
          Toast
        </Button>
        <Button size="sm" variant="secondary" onPress={() => setSheet(true)}>
          Sheet
        </Button>
        <Button size="sm" variant="secondary" onPress={() => setDialog(true)}>
          ConfirmDialog
        </Button>
      </View>
      <Skeleton className="h-6 w-2/3 rounded-8" />
      <Spinner />
      <EmptyState icon="search" title="Nada por aqui" description="Estado vazio com ícone." />
      <ErrorState onRetry={() => toast.info('Tentando de novo')} />
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Sheet">
        <Text>Conteúdo do sheet.</Text>
      </Sheet>
      <ConfirmDialog
        open={dialog}
        title="Excluir?"
        message="Não dá para desfazer."
        destructive
        onConfirm={() => setDialog(false)}
        onCancel={() => setDialog(false)}
      />
    </CatalogSection>
  );
}

export function LayoutSection() {
  return (
    <CatalogSection
      title="Layout"
      note="Card, SectionCard, ListItem e ResponsiveGrid (1 coluna no celular, 2 no tablet)."
    >
      <Card>
        <Text>Card padrão</Text>
      </Card>
      <SectionCard title="SectionCard" description="Título Fraunces e legenda">
        <Text tone="muted">Conteúdo</Text>
      </SectionCard>
      <ListItem
        title="Transporte por app"
        subtitle="Hoje, 08:12"
        leadingIcon="car"
        showChevron
        onPress={() => undefined}
      />
      <ResponsiveGrid gap={12}>
        <Card variant="muted">
          <Text>Coluna 1</Text>
        </Card>
        <Card variant="muted">
          <Text>Coluna 2</Text>
        </Card>
      </ResponsiveGrid>
    </CatalogSection>
  );
}
