import { cents } from '@guara/utils';
import { BriefcaseIcon, InboxIcon, ReceiptTextIcon, ShoppingCartIcon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AiDisclaimer, EmptyState, ErrorState, OfflineBanner, toast } from '@/components/feedback';
import { ResponsiveGrid, Section } from '@/components/layout';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  ConfirmDialog,
  Divider,
  ListItem,
  MoneyText,
  ProgressBar,
  RadioGroup,
  SegmentedControl,
  Sheet,
  Skeleton,
  Spinner,
  Switch,
  Text,
} from '@/components/ui';

import { CatalogSection, Example } from './CatalogSection';

export function SelectionSection() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [horizon, setHorizon] = useState<'short' | 'medium' | 'long' | null>(null);
  const [banks, setBanks] = useState({ a: true, b: false });
  const [categories, setCategories] = useState<string[]>(['Mercado']);
  const [period, setPeriod] = useState<'6m' | '12m' | 'all'>('6m');

  const toggleCategory = (name: string) =>
    setCategories((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );

  return (
    <CatalogSection title="Seleção" note="Switch, RadioGroup, Checkbox, Chip e SegmentedControl.">
      <View>
        <Switch
          label="Notificações push"
          description="Alertas de teto e de preço"
          value={push}
          onValueChange={setPush}
        />
        <Switch label="E-mail" value={email} onValueChange={setEmail} />
        <Switch label="SMS (indisponível)" value={false} onValueChange={() => undefined} disabled />
      </View>
      <Example label="RadioGroup — pergunta do perfil de investidor (exemplo)">
        <RadioGroup
          accessibilityLabel="Por quanto tempo pretende deixar o dinheiro investido?"
          value={horizon}
          onChange={setHorizon}
          options={[
            { value: 'short', label: 'Até 1 ano' },
            { value: 'medium', label: 'De 1 a 5 anos' },
            { value: 'long', label: 'Mais de 5 anos', description: 'Aceito oscilações no caminho' },
          ]}
        />
      </Example>
      <View>
        <Checkbox
          label="Banco Exemplo A"
          checked={banks.a}
          onChange={(a) => setBanks((s) => ({ ...s, a }))}
        />
        <Checkbox
          label="Banco Exemplo B"
          checked={banks.b}
          onChange={(b) => setBanks((s) => ({ ...s, b }))}
        />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {['Mercado', 'Transporte', 'Lazer', 'Saúde'].map((name) => (
          <Chip
            key={name}
            label={name}
            selected={categories.includes(name)}
            onPress={() => toggleCategory(name)}
          />
        ))}
        <Chip label="Desabilitado" selected={false} onPress={() => undefined} disabled />
      </View>
      <SegmentedControl
        accessibilityLabel="Período"
        value={period}
        onChange={setPeriod}
        options={[
          { value: '6m', label: '6M', accessibilityLabel: '6 meses' },
          { value: '12m', label: '12M', accessibilityLabel: '12 meses' },
          { value: 'all', label: 'Tudo' },
        ]}
      />
    </CatalogSection>
  );
}

const BUDGET_LIMIT = cents(100_000); // R$ 1.000,00
const BUDGET_MARKERS = [cents(50_000), cents(70_000)]; // avisos em R$ 500,00 e R$ 700,00

function BudgetExample({ spent, label }: { spent: number; label: string }) {
  return (
    <Example label={label}>
      <View className="gap-2">
        <View className="flex-row justify-between">
          <MoneyText value={cents(spent)} variant="label" />
          <MoneyText value={BUDGET_LIMIT} variant="label" tone="muted" />
        </View>
        <ProgressBar
          value={spent}
          max={BUDGET_LIMIT}
          markers={BUDGET_MARKERS}
          accessibilityLabel={`Teto de mercado (exemplo): ${label}`}
        />
      </View>
    </Example>
  );
}

export function DisplaySection() {
  return (
    <CatalogSection
      title="Exibição"
      note="Card, ListItem, Badge, Avatar, ProgressBar, Divider, Skeleton e Spinner."
    >
      <Card>
        <Text variant="label" tone="muted">
          Card padrão
        </Text>
        <MoneyText value={cents(1_234_567)} variant="title" />
      </Card>
      <Card variant="elevated" onPress={() => toast.info('Card pressionado')}>
        <Text>Card elevado e pressionável</Text>
      </Card>
      <Card padding="none">
        <ListItem
          leadingIcon={BriefcaseIcon}
          title="Salário (exemplo)"
          subtitle="Conta corrente • Banco Exemplo"
          trailing={<MoneyText value={cents(500_000)} showSign colorBySign variant="label" />}
          trailingCaption="05/10"
          onPress={() => undefined}
          showChevron
        />
        <Divider inset />
        <ListItem
          leadingIcon={ShoppingCartIcon}
          title="Supermercado (exemplo)"
          subtitle="Cartão final 0000 • 2/3"
          trailing={<MoneyText value={cents(-8_990)} colorBySign variant="label" />}
          trailingCaption="Hoje"
          onPress={() => undefined}
          showChevron
        />
        <Divider inset />
        <ListItem
          leading={<Avatar name="Streaming Exemplo" size="md" />}
          title="Streaming Exemplo"
          subtitle="Assinatura mensal"
          trailing={<MoneyText value={null} variant="label" />}
        />
      </Card>
      <View className="flex-row flex-wrap gap-2">
        <Badge label="Conectado" tone="positive" />
        <Badge label="Expirando" tone="warning" />
        <Badge label="Expirado" tone="negative" />
        <Badge label="Open Finance" tone="info" />
        <Badge label="Manual" />
        <Badge label="Compra" tone="positive" />
        <Badge label="Venda" tone="negative" />
        <Badge label="Risco alto" tone="negative" />
      </View>
      <View className="flex-row items-center gap-3">
        <Avatar name="Banco Exemplo" size="sm" />
        <Avatar name="Banco Exemplo" size="md" />
        <Avatar name="Banco Exemplo" size="lg" />
        <Avatar name="Imagem quebrada" source={{ uri: 'https://invalid.example/x.png' }} />
      </View>
      <BudgetExample spent={30_000} label="R$ 300 de R$ 1.000 — normal" />
      <BudgetExample spent={72_000} label="R$ 720 — passou do aviso de R$ 700" />
      <BudgetExample spent={105_000} label="R$ 1.050 — estourou o teto" />
      <Example label="Skeleton e Spinner">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <View className="flex-1 gap-2">
            <Skeleton className="w-1/2" />
            <Skeleton className="w-1/3" />
          </View>
          <Spinner />
        </View>
      </Example>
    </CatalogSection>
  );
}

export function FeedbackSection() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  return (
    <CatalogSection
      title="Feedback e sobreposições"
      note="Estados, aviso de IA, offline, toast, sheet e confirmação."
    >
      <Card padding="none">
        <EmptyState
          icon={InboxIcon}
          title="Nenhum teto ainda"
          description="Crie um teto para acompanhar seus gastos por categoria."
          action={{ label: 'Criar teto', onPress: () => undefined }}
        />
      </Card>
      <Card padding="none">
        <ErrorState onRetry={() => toast.info('Tentando de novo…')} />
      </Card>
      <AiDisclaimer />
      <OfflineBanner visible />
      <View className="flex-row flex-wrap gap-2">
        <Button variant="secondary" size="sm" onPress={() => toast.success('Teto criado')}>
          Toast sucesso
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => toast.error('Não foi possível salvar')}
        >
          Toast erro
        </Button>
        <Button variant="secondary" size="sm" onPress={() => toast.info('Sincronizando bancos')}>
          Toast info
        </Button>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button variant="secondary" onPress={() => setSheetOpen(true)}>
          Abrir sheet
        </Button>
        <Button variant="destructive" onPress={() => setDialogOpen(true)}>
          Revogar consentimento
        </Button>
      </View>
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filtros (exemplo)">
        <Text tone="muted">Conteúdo do sheet com o visual do app.</Text>
        <Button fullWidth onPress={() => setSheetOpen(false)}>
          Aplicar
        </Button>
      </Sheet>
      <ConfirmDialog
        open={dialogOpen}
        title="Revogar consentimento?"
        message="O Banco Exemplo deixará de ser sincronizado. Você pode conectar de novo depois."
        confirmLabel="Revogar"
        destructive
        loading={revoking}
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => {
          setRevoking(true);
          setTimeout(() => {
            setRevoking(false);
            setDialogOpen(false);
            toast.success('Consentimento revogado (exemplo)');
          }, 1200);
        }}
      />
    </CatalogSection>
  );
}

export function LayoutSection() {
  return (
    <CatalogSection
      title="Layout"
      note="Section e ResponsiveGrid (1 coluna no celular, 2+ no tablet)."
    >
      <Section title="Metas (exemplo)" action={{ label: 'Ver tudo', onPress: () => undefined }}>
        <ResponsiveGrid>
          {['Reserva de emergência', 'Viagem', 'Entrada do imóvel'].map((goal) => (
            <Card key={goal}>
              <Text variant="label">{goal}</Text>
              <Text variant="caption" tone="muted">
                Meta fictícia
              </Text>
            </Card>
          ))}
        </ResponsiveGrid>
      </Section>
      <Example label="Ícone de lista">
        <ListItem
          leadingIcon={ReceiptTextIcon}
          title="Relatórios"
          showChevron
          onPress={() => undefined}
        />
      </Example>
    </CatalogSection>
  );
}
