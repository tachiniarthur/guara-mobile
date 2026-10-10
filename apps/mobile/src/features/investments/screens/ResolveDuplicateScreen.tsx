import { addCents, formatCents, formatDate, orEmpty } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { EmptyState, toast } from '@/components/feedback';
import {
  PageHeader,
  ResponsiveGrid,
  Screen,
  SectionCard,
  StickyFooter,
  TopBar,
} from '@/components/layout';
import { Badge, Button, DataRow, InfoNote, RadioGroup, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { QUOTES, type Position } from '../data';
import { type DuplicateChoice, type PositionDuplicate } from '../duplicate-data';
import { usePositionDuplicates } from '../hooks/usePositionDuplicates';
import { useInvestmentsStore } from '../store';

const CHOICES: DuplicateChoice[] = ['delete_manual', 'keep_separate', 'sum'];

const DONE_MESSAGE: Record<DuplicateChoice, string> = {
  delete_manual: 'Cadastro manual excluído. Fica só o do banco.',
  keep_separate: 'Os dois ficam separados na carteira.',
  sum: 'Somados em uma posição só.',
};

const isChoice = (value: string | undefined): value is DuplicateChoice =>
  CHOICES.includes(value as DuplicateChoice);

function SourceCard({
  badge,
  name,
  rows,
}: {
  badge: { label: string; tone: 'info' | 'neutral'; icon: 'bank' | 'pencil' };
  name: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <View className="min-w-0 gap-2.5 rounded-24 border border-border bg-surface p-5">
      <Badge label={badge.label} tone={badge.tone} icon={badge.icon} />
      <Text serif weight="bold" size={20} leading={1.3}>
        {name}
      </Text>
      <View>
        {rows.map((row) => (
          <DataRow key={row.label} label={row.label} value={row.value} />
        ))}
      </View>
    </View>
  );
}

function DuplicateBody({
  duplicate,
  position,
}: {
  duplicate: PositionDuplicate;
  position: Position;
}) {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const params = useLocalSearchParams<{ choice?: string }>();
  const resolve = useInvestmentsStore((state) => state.resolveDuplicate);
  const [choice, setChoice] = useState<DuplicateChoice>(
    isChoice(params.choice) ? params.choice : 'delete_manual',
  );
  const { manual, bank } = duplicate;
  const later = () => (router.canGoBack() ? router.back() : router.replace('/investments'));
  const confirm = () => {
    resolve(duplicate.id, choice);
    toast.success(DONE_MESSAGE[choice]);
    later();
  };

  const intro = (
    <Text size={15} tone="muted" leading={1.55}>
      {`O mesmo título chegou pelo Open Finance do ${bank} e também está no seu cadastro manual. Se for o mesmo dinheiro, a carteira conta duas vezes. Escolha o que fazer; nada muda até você confirmar.`}
    </Text>
  );
  const cards = (
    <>
      <SourceCard
        badge={{ label: `Open Finance · ${bank}`, tone: 'info', icon: 'bank' }}
        name={position.name}
        rows={[
          { label: 'Valor hoje', value: formatCents(position.value) },
          { label: 'Quantidade', value: orEmpty(position.quantity) },
          { label: 'Atualizado', value: `Hoje, ${QUOTES.time} · sozinho` },
        ]}
      />
      <SourceCard
        badge={{ label: 'Cadastro manual', tone: 'neutral', icon: 'pencil' }}
        name={position.name}
        rows={[
          { label: 'Valor informado', value: formatCents(manual.value) },
          { label: 'Quantidade', value: orEmpty(manual.quantity) },
          { label: 'Cadastrado', value: `${formatDate(manual.registeredOn)} · à mão` },
        ]}
      />
    </>
  );
  const options = (
    <RadioGroup
      accessibilityLabel="O que fazer?"
      value={choice}
      onChange={setChoice}
      options={[
        {
          value: 'delete_manual',
          label: 'Excluir o cadastro manual',
          description: `Fica só o do ${bank}, que atualiza sozinho. Use quando é o mesmo título.`,
        },
        {
          value: 'keep_separate',
          label: 'Manter separados',
          description: 'Os dois aparecem na carteira. Use quando são compras diferentes.',
        },
        {
          value: 'sum',
          label: 'Somar os dois',
          description: `Vira uma posição só, com ${formatCents(addCents(position.value, manual.value))}. Use quando o manual é outra compra do mesmo título.`,
        },
      ]}
    />
  );
  const note = (
    <InfoNote icon="infoLarge" tone="info" size={13}>
      {`Enquanto você não decide, contamos só o valor do ${bank} no total da carteira para não somar em dobro.`}
    </InfoNote>
  );

  if (isTablet) {
    return (
      <View className="flex-1">
        <Screen contentClassName="pb-28">
          <PageHeader
            title="Investimento duplicado"
            subtitle={position.name}
            breadcrumb={{
              parents: [{ label: 'Investimentos', href: '/investments' }],
              current: 'Duplicidade',
            }}
          />
          {intro}
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch>
            {cards}
          </ResponsiveGrid>
          <SectionCard title="O que fazer?" titleSize={20} padding={24}>
            {options}
          </SectionCard>
          {note}
          <View className="flex-row justify-end gap-2.5">
            <Button variant="ghost" size="md" className="px-4.5" onPress={later}>
              Decidir depois
            </Button>
            <Button size="md" className="px-4.5" onPress={confirm}>
              Confirmar
            </Button>
          </View>
        </Screen>
        <ChatFab />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        header={<TopBar title="Investimento duplicado" leading="close" onLeadingPress={later} />}
        footer={
          <StickyFooter>
            <Button variant="ghost" size="lg" onPress={later}>
              Depois
            </Button>
            <Button size="lg" leftIcon="check" className="flex-1" onPress={confirm}>
              Confirmar
            </Button>
          </StickyFooter>
        }
        contentClassName="gap-4 pb-20 pt-2"
      >
        {intro}
        {cards}
        <Text serif weight="bold" size={18} leading={1.25} accessibilityRole="header">
          O que fazer?
        </Text>
        {options}
        {note}
      </Screen>
      <ChatFab />
    </View>
  );
}

/** Investimento duplicado: delete the manual entry, keep both or sum them. */
export function ResolveDuplicateScreen() {
  const router = useRouter();
  const { duplicateId } = useLocalSearchParams<{ duplicateId: string }>();
  const found = usePositionDuplicates().find(duplicateId);
  if (!found) {
    return (
      <Screen
        header={
          <TopBar title="Investimento duplicado" leading="close" fallbackHref="/investments" />
        }
        centered
      >
        <EmptyState
          icon="search"
          title="Duplicidade não encontrada"
          description="Ela pode já ter sido resolvida."
          action={{ label: 'Ver investimentos', onPress: () => router.replace('/investments') }}
        />
      </Screen>
    );
  }
  return <DuplicateBody duplicate={found.duplicate} position={found.position} />;
}
