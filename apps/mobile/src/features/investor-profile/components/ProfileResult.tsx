import type { InvestorProfileType } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { DonutChart } from '@/components/charts';
import { SectionCard } from '@/components/layout';
import { InfoNote, Span, Text } from '@/components/ui';
import { ASSET_CLASSES } from '@/features/investments';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { PROFILE_LABELS, PROFILE_QUESTIONS, type ProfileAnswers } from '../data';
import {
  NOTABLE_GAP,
  answeredCount,
  answersSummary,
  compareAllocation,
  differenceText,
  profileDescription,
} from '../lib/profile';

const ORDER: InvestorProfileType[] = ['conservative', 'moderate', 'aggressive'];

/**
 * Target allocation of each profile. Only the Moderado one is in the design (the "Alvo do
 * perfil" of Investimentos); the others come with the API.
 */
function targetsFor(type: InvestorProfileType): Record<string, number> | null {
  if (type !== 'moderate') return null;
  return Object.fromEntries(ASSET_CLASSES.map((item) => [item.key, item.target]));
}

/** Conservador · Moderado · Arrojado with the user's profile highlighted. */
function ProfileScale({ type }: { type: InvestorProfileType }) {
  const index = ORDER.indexOf(type);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Seu perfil: ${PROFILE_LABELS[type]}${
        index === 1 ? ', entre Conservador e Arrojado' : ''
      }`}
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

function TargetAllocationCard({ type }: { type: InvestorProfileType }) {
  const { isTablet } = useBreakpoint();
  const targets = targetsFor(type);
  const label = PROFILE_LABELS[type];
  if (!targets) {
    return (
      <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
        {`A alocação-alvo do perfil ${label} aparece quando a sua carteira for analisada pelo Pacu.`}
      </InfoNote>
    );
  }
  const comparison = compareAllocation(ASSET_CLASSES, targets);
  const donut = (
    <DonutChart
      size={150}
      segments={comparison.rows.map((row) => ({
        key: row.key,
        value: row.target,
        color: row.color,
      }))}
    >
      <Text size={12} tone="subtle">
        Alvo
      </Text>
      <Text serif weight="bold" size={17}>
        {label}
      </Text>
    </DonutChart>
  );
  const rows = (
    <View>
      {comparison.rows.map((row, index) => {
        const notable = Math.abs(row.difference) >= NOTABLE_GAP;
        return (
          <View
            key={row.key}
            accessible
            accessibilityLabel={`${row.label}: alvo ${row.target}%, sua carteira ${row.current}%, ${differenceText(row.difference)}`}
            className={cn(
              'gap-1.5 py-2.5',
              index < comparison.rows.length - 1 && 'border-b border-border',
            )}
          >
            <View className="flex-row items-center gap-2.5">
              <View className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: row.color }} />
              <Text weight="semibold" className="flex-1">
                {row.label}
              </Text>
              <Text weight="bold" tabular>
                {row.target}%
              </Text>
            </View>
            <View className="h-2 rounded-4 bg-surface-muted">
              <View
                className="absolute left-0 top-0 h-2 rounded-4"
                style={{
                  width: `${(row.target / comparison.scale) * 100}%`,
                  backgroundColor: row.color,
                }}
              />
              <View
                className="absolute w-0.5 bg-foreground"
                style={{
                  left: `${(row.current / comparison.scale) * 100}%`,
                  marginLeft: -1,
                  top: -3,
                  height: 14,
                }}
              />
            </View>
            <Text size={12} tone="subtle">
              {`sua carteira ${row.current}% · `}
              <Span
                weight="bold"
                tone={notable ? (row.difference > 0 ? 'negative' : 'info') : 'subtle'}
              >
                {differenceText(row.difference)}
              </Span>
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <SectionCard
      title="Como o Guará vai dividir as sugestões"
      description={`Alocação-alvo do perfil ${label} · a marca branca é a sua carteira hoje`}
      titleSize={18}
      padding={18}
    >
      {isTablet ? (
        <View className="flex-row items-center gap-6">
          {donut}
          <View className="min-w-0 flex-1">{rows}</View>
        </View>
      ) : (
        <>
          <View className="items-center">{donut}</View>
          {rows}
        </>
      )}
      <InfoNote icon="info" tone="warning" size={13} iconColor={colors.warning.DEFAULT}>
        <Text size={13} leading={1.5}>
          {comparison.close
            ? 'Sua carteira está perto do alvo.'
            : 'Sua carteira está longe do alvo.'}
          {comparison.biggest ? (
            <>
              {' A maior diferença é '}
              <Span weight="bold">
                {`${comparison.biggest.label}, ${comparison.biggest.points} p.p. ${comparison.biggest.direction}`}
              </Span>
              .
            </>
          ) : null}{' '}
          O Pacu pode sugerir como ajustar, mas nada muda sem você.
        </Text>
      </InfoNote>
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
}

/** "Seu perfil é Moderado": scale, target allocation against the portfolio and the answers. */
export function ProfileResult({ type, answers, note }: ProfileResultProps) {
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
      <TargetAllocationCard type={type} />
      <AnswersCard answers={answers} />
      <Text size={13} leading={1.55} tone="subtle">
        O perfil vale só para Investimentos. Você pode refazer quando quiser em Meu perfil.
      </Text>
    </>
  );
}
