import { colors } from '@guara/ui-tokens';
import { formatCents, formatDate } from '@guara/utils';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { MataSurface } from '@/components/illustrations';
import {
  GridCellReset,
  PageHeader,
  ResponsiveGrid,
  Screen,
  SectionCard,
  TopBar,
} from '@/components/layout';
import { Button, IconButton, Span, Text, type TextTone } from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab, conversationHref } from '@/navigation';

import { AllocationRings, GroupTargetList, OutOfTargetNote } from '../components/allocation';
import { REBALANCE_CONTRIBUTION } from '../data';
import { useAllocation } from '../hooks/useAllocation';
import {
  barScale,
  differenceText,
  gapText,
  rebalanceSuggestion,
  type GroupRow,
} from '../lib/allocation';

const PROFILES = '/investments/allocation/profiles';
const REDO_PROFILE = '/account/investor-profile';

function Stat({
  label,
  value,
  caption,
  tone = 'default',
}: {
  label: string;
  value: string;
  caption: string;
  tone?: TextTone;
}) {
  return (
    <SectionCard padding={16} gap={6} className="flex-1">
      <Text size={14} tone="muted">
        {label}
      </Text>
      <Text serif weight="extrabold" size={20} leading={1.1} tabular tone={tone}>
        {value}
      </Text>
      <Text size={13} tone="subtle">
        {caption}
      </Text>
    </SectionCard>
  );
}

function GapLine({ group, last }: { group: GroupRow; last: boolean }) {
  const text = gapText(group.gap);
  return (
    <View
      accessible
      className={
        last
          ? 'flex-row items-center gap-3 py-3'
          : 'flex-row items-center gap-3 border-b border-border py-3'
      }
    >
      <View className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: group.color }} />
      <View className="min-w-0 flex-1">
        <Text weight="semibold" leading={1.35}>
          {group.label}
        </Text>
        {text ? (
          <Text size={13} weight="bold" leading={1.35} tone={group.gap < 0 ? 'info' : 'negative'}>
            {text}
          </Text>
        ) : null}
        <Text size={12} tone="subtle" leading={1.35}>
          {`hoje ${formatCents(group.value)} · alvo ${formatCents(group.targetValue)}`}
        </Text>
      </View>
    </View>
  );
}

/** "Alocação": the portfolio against the target of the investor profile, in 5 groups. */
export function AllocationScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { label, answeredOn, total, groups, out, biggest, positionsCount } = useAllocation();
  const suggestion = rebalanceSuggestion(groups, REBALANCE_CONTRIBUTION);
  const outText = `${out.length} de ${groups.length} grupos`;

  const rings = (
    <SectionCard
      title="Sua carteira × alvo"
      description="Bens (imóvel e veículo) não entram na conta"
      titleSize={18}
      padding={isTablet ? 22 : 18}
      gap={14}
    >
      <AllocationRings groups={groups} profileLabel={label} positionsCount={positionsCount} />
    </SectionCard>
  );

  const byGroup = (
    <SectionCard
      title="Grupo por grupo"
      description="Toque num grupo para ver as subclasses · a marca branca é o alvo"
      titleSize={18}
      padding={isTablet ? 22 : 18}
      gap={8}
    >
      <GroupTargetList
        groups={groups}
        scale={barScale(
          groups.flatMap((group) => [group.current, group.target]),
          40,
        )}
        defaultOpen={
          isTablet ? groups.slice(0, 3).map((group) => group.key) : biggest ? [biggest.key] : []
        }
      />
    </SectionCard>
  );

  const gaps = (
    <SectionCard
      title="Quanto falta para o alvo"
      description={`Em reais, sobre ${formatCents(total)} investidos`}
      titleSize={18}
      padding={22}
      gap={14}
    >
      <View>
        {groups.map((group, index) => (
          <GapLine key={group.key} group={group} last={index === groups.length - 1} />
        ))}
      </View>
      <Text size={13} tone="subtle" leading={1.55}>
        É só a distância até o alvo. O Guará não compra nem vende nada; você decide se e como
        ajustar.
      </Text>
    </SectionCard>
  );

  const pacu = suggestion ? (
    <AssistantNote
      assistant="pacu"
      className={isTablet ? 'flex-1' : undefined}
      actions={
        <Button
          variant="secondary"
          size="md"
          className="h-10 px-4.5"
          onPress={() => router.navigate(conversationHref(undefined, { assistant: 'pacu' }))}
        >
          Conversar com o Pacu
        </Button>
      }
    >
      {suggestion}
    </AssistantNote>
  ) : null;

  const note = <OutOfTargetNote groups={groups} />;

  const tablet = (
    <>
      <PageHeader
        title="Alocação"
        subtitle={`Carteira-alvo do perfil ${label} em 5 grupos`}
        breadcrumb={{
          parents: [{ label: 'Investimentos', href: '/investments' }],
          current: 'Alocação',
        }}
        actions={
          <View className="flex-row items-center gap-2">
            <Button variant="secondary" size="md" onPress={() => router.navigate(PROFILES)}>
              Comparar os 4 perfis
            </Button>
            <Button variant="ghost" size="md" onPress={() => router.navigate(REDO_PROFILE)}>
              Mudar perfil
            </Button>
          </View>
        }
      />
      <ResponsiveGrid columns={{ tablet: 4 }} gap={12}>
        <Stat label="Seu perfil" value={label} caption={`definido em ${formatDate(answeredOn)}`} />
        <Stat
          label="Na alocação"
          value={formatCents(total)}
          caption={`${positionsCount} ${positionsCount === 1 ? 'ativo' : 'ativos'} · sem os bens`}
        />
        <Stat
          label="Fora do alvo"
          value={outText}
          caption="diferença maior que 5 p.p."
          tone={out.length ? 'brand' : 'default'}
        />
        <Stat
          label="Maior diferença"
          value={biggest ? differenceText(biggest.difference) : 'no alvo'}
          caption={biggest ? biggest.label : 'todos os grupos'}
          tone={biggest && biggest.difference > 0 ? 'negative' : 'default'}
        />
      </ResponsiveGrid>
      {note}
      <ResponsiveGrid>
        <GridCellReset>
          <View className="flex-1 gap-5">
            {rings}
            {pacu}
            {gaps}
          </View>
        </GridCellReset>
        {byGroup}
      </ResponsiveGrid>
    </>
  );

  const phone = (
    <>
      <MataSurface
        veil={[0.85, 0.55, 0.1]}
        className="gap-2.5 rounded-24 border border-border-strong bg-hero p-5"
      >
        <Text size={14} style={{ color: colors.hero.label }}>
          {`Perfil ${label} · ${formatCents(total)} investidos`}
        </Text>
        <View className="flex-row flex-wrap items-baseline">
          <Text serif weight="extrabold" size={30} leading={1.1} tabular>
            {out.length ? outText : 'Perto do alvo'}
          </Text>
          <Text serif size={16} weight="medium" tone="muted">
            {out.length ? ' fora do alvo' : ' em todos os grupos'}
          </Text>
        </View>
        {biggest ? (
          <Text size={14} style={{ color: colors.hero.caption }}>
            Maior diferença:{' '}
            <Span weight="bold" style={{ color: colors.hero.foreground }}>
              {`${biggest.label}, ${differenceText(biggest.difference)}`}
            </Span>
          </Text>
        ) : null}
      </MataSurface>
      {note}
      {rings}
      {byGroup}
      {gaps}
      {pacu}
      <Button variant="secondary" size="lg" fullWidth onPress={() => router.navigate(PROFILES)}>
        Comparar os 4 perfis
      </Button>
    </>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Alocação"
              subtitle={`Perfil ${label}`}
              fallbackHref="/investments"
              actions={
                <IconButton
                  icon="user"
                  accessibilityLabel="Mudar perfil"
                  onPress={() => router.navigate(REDO_PROFILE)}
                />
              }
            />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? tablet : phone}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
