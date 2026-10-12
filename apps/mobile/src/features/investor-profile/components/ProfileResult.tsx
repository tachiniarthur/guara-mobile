import type { InvestorProfileType } from '@guara/types';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { LinkButton, Span, Text } from '@/components/ui';
import {
  GroupTargetList,
  OutOfTargetNote,
  TargetRing,
  barScale,
  shareText,
  useAllocation,
} from '@/features/investments';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { PROFILE_LABELS, PROFILE_QUESTIONS, type ProfileAnswers } from '../data';
import { answeredCount, answersSummary, profileDescription } from '../lib/profile';

const ORDER: InvestorProfileType[] = ['conservative', 'moderate', 'aggressive', 'sophisticated'];

/** Conservador · Moderado · Arrojado · Sofisticado with the user's profile highlighted. */
function ProfileScale({ type }: { type: InvestorProfileType }) {
  const index = ORDER.indexOf(type);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Seu perfil: ${PROFILE_LABELS[type]}, o ${index + 1}º de ${ORDER.length} níveis: Conservador, Moderado, Arrojado e Sofisticado`}
      className="flex-row gap-1.5"
    >
      {ORDER.map((item) => (
        <View key={item} className="flex-1 items-center gap-1.5">
          <View
            className={cn('h-2 w-full rounded-4', item === type ? 'bg-brand' : 'bg-surface-muted')}
          />
          <Text
            size={13}
            weight={item === type ? 'extrabold' : 'medium'}
            tone={item === type ? 'default' : 'subtle'}
          >
            {PROFILE_LABELS[item]}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TargetAllocationCard({
  type,
  onCompare,
}: {
  type: InvestorProfileType;
  onCompare?: () => void;
}) {
  const { isTablet } = useBreakpoint();
  const { label, groups } = useAllocation(type);
  const donut = <TargetRing groups={groups} profileLabel={label} size={150} />;
  const targets = (
    <View className="min-w-0 flex-1">
      {groups.map((group) => (
        <View key={group.key} className="flex-row items-center gap-2 py-1">
          <View className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: group.color }} />
          <Text size={14} className="min-w-0 flex-1">
            {group.label}
          </Text>
          <Text size={14} weight="bold" tabular>
            {shareText(group.target)}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SectionCard
      title="Como o Guará vai dividir as sugestões"
      description={`Carteira-alvo do perfil ${label} em 5 grupos · toque num grupo para ver as subclasses · a marca branca é a sua carteira hoje`}
      titleSize={isTablet ? 20 : 18}
      padding={isTablet ? 22 : 18}
    >
      {isTablet ? (
        <View className="flex-row items-center gap-6">
          {donut}
          {targets}
        </View>
      ) : (
        <View className="items-center">{donut}</View>
      )}
      <GroupTargetList
        groups={groups}
        scale={barScale(
          groups.flatMap((group) => [group.current, group.target]),
          40,
        )}
      />
      <OutOfTargetNote
        groups={groups}
        suffix="O Pacu pode sugerir como ajustar, mas nada muda sem você."
      />
      {onCompare ? (
        <View className="flex-row justify-end">
          <LinkButton label="Comparar os 4 perfis" chevron={false} onPress={onCompare} />
        </View>
      ) : null}
    </SectionCard>
  );
}

function AnswersCard({ answers }: { answers: ProfileAnswers }) {
  return (
    <SectionCard title="Suas respostas" titleSize={18} padding={18}>
      <View className="flex-row flex-wrap" style={{ rowGap: 12, columnGap: 14 }}>
        {answersSummary(answers).map((item) => (
          <View
            key={item.label}
            accessible
            accessibilityLabel={`${item.label}: ${item.value}`}
            className="gap-0.5"
            style={{ width: '47%' }}
          >
            <Text size={13} tone="subtle">
              {item.label}
            </Text>
            <Text size={13} weight="semibold">
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

export interface ProfileResultProps {
  type: InvestorProfileType;
  answers: ProfileAnswers;
  /** Extra note under the scale ("Antes: Moderado… Agora: …"). */
  note?: ReactNode;
  /** "Comparar os 4 perfis" (inside the app; the onboarding has no Investimentos yet). */
  onCompare?: () => void;
}

/** "Seu perfil é Moderado": scale, target allocation against the portfolio and the answers. */
export function ProfileResult({ type, answers, note, onCompare }: ProfileResultProps) {
  const { isTablet } = useBreakpoint();
  return (
    <>
      <View className="gap-2.5">
        <Text size={13} tone="subtle">
          {`Resultado · ${answeredCount(answers)} de ${PROFILE_QUESTIONS.length} respondidas`}
        </Text>
        <Text
          serif
          weight="extrabold"
          size={isTablet ? 30 : 26}
          leading={1.2}
          tracking={-0.01}
          accessibilityRole="header"
        >
          Seu perfil é <Span tone="brand">{PROFILE_LABELS[type]}</Span>
        </Text>
        <Text size={15} leading={1.55} tone="muted">
          {profileDescription(type, answers)}
        </Text>
      </View>
      <ProfileScale type={type} />
      {note}
      <TargetAllocationCard type={type} onCompare={onCompare} />
      <AnswersCard answers={answers} />
      <Text size={13} leading={1.55} tone="subtle">
        O perfil vale só para Investimentos. Você pode refazer quando quiser em Meu perfil.
      </Text>
    </>
  );
}
