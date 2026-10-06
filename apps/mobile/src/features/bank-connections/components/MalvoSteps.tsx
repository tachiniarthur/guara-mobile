import { colors } from '@guara/ui-tokens';
import { EMPTY, formatDate, formatDateTime, formatTime } from '@guara/utils';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { LoadingRing } from '@/components/feedback';
import { Icon, InfoNote, LinkButton, Span, Text, type IconName } from '@/components/ui';
import { cn } from '@/lib/cn';
import { usePlan } from '@/stores';

import {
  CONSENT_MONTHS,
  CONSENT_PURPOSE,
  CONSENT_VIA,
  MALVO_ERROR,
  MALVO_SCOPES,
  type BankConnection,
  type BankOptionData,
  type MalvoFindings,
} from '../data';
import type { MalvoMode } from '../hooks/useMalvoFlow';

/** Logo tile of a bank (letters on Mata à noite). */
export function BankTile({ mark, size = 56 }: { mark: string; size?: 34 | 44 | 56 }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn(
        'items-center justify-center border border-border bg-background',
        size === 56 ? 'rounded-16' : size === 44 ? 'rounded-12' : 'rounded-10',
      )}
      style={{ width: size, height: size }}
    >
      <Text serif weight="bold" size={size === 56 ? 22 : size === 44 ? 17 : 14} leading={1}>
        {mark}
      </Text>
    </View>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <Text serif weight="bold" size={17} leading={1.25} accessibilityRole="header">
      {children}
    </Text>
  );
}

/** Two-column `dl` ("Vale por 12 meses", "Até 23/09/2027"…). */
function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <View className="flex-row flex-wrap" style={{ rowGap: 12, columnGap: 14 }}>
      {items.map((item) => (
        <View
          key={item.label}
          accessible
          accessibilityLabel={`${item.label}: ${item.value}`}
          className="min-w-0 gap-0.5"
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
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <View className="gap-3.5 rounded-24 border border-border bg-surface p-4.5">{children}</View>
  );
}

function IconTile({ icon, tone }: { icon: IconName; tone: 'positive' | 'neutral' }) {
  return (
    <View
      className={cn(
        'h-9 w-9 items-center justify-center rounded-12',
        tone === 'positive' ? 'bg-positive-muted' : 'bg-surface-muted',
      )}
    >
      <Icon
        name={icon}
        size={18}
        color={tone === 'positive' ? colors.positive.DEFAULT : colors.foreground.muted}
      />
    </View>
  );
}

/** Big round badge on top of the result screens. */
function ResultBadge({ tone }: { tone: 'positive' | 'negative' }) {
  return (
    <View
      className={cn(
        'h-[72px] w-[72px] items-center justify-center rounded-full',
        tone === 'positive' ? 'bg-positive-muted' : 'bg-negative-muted',
      )}
    >
      <Icon
        name={tone === 'positive' ? 'check' : 'alertTriangle'}
        size={32}
        strokeWidth={2}
        color={tone === 'positive' ? colors.positive.DEFAULT : colors.negative.DEFAULT}
      />
    </View>
  );
}

function ResultHeader({
  badge,
  title,
  description,
}: {
  badge: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View className="items-center gap-3 pt-2">
      {badge}
      <Text
        serif
        weight="extrabold"
        size={26}
        leading={1.2}
        align="center"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text size={15} leading={1.55} tone="muted" align="center">
        {description}
      </Text>
    </View>
  );
}

export interface ConsentBodyProps {
  bank: BankOptionData;
  mode: MalvoMode;
  /** The current consent (renewal). */
  connection: BankConnection | null;
  authorizedUntil: string;
}

/** "Conectar Itaú" / "Renovar autorização do Itaú": what is shared, for how long and how. */
export function ConsentBody({ bank, mode, connection, authorizedUntil }: ConsentBodyProps) {
  const renew = mode === 'renew';
  const steps = [
    { title: 'Você confirma aqui o que será compartilhado', detail: 'Agora' },
    {
      title: `O Malvo abre o app do ${bank.name}`,
      detail: 'Login com sua senha, só no app do banco',
    },
    {
      title: `Você autoriza no ${bank.name} e volta para o Guará`,
      detail: 'Leva cerca de 1 minuto',
    },
  ];
  const duration = renew
    ? [
        {
          label: 'Autorização atual',
          value: connection ? `até ${formatDate(connection.authorizedUntil)}` : EMPTY,
        },
        { label: 'Nova autorização', value: `até ${formatDate(authorizedUntil)}` },
      ]
    : [
        { label: 'Vale por', value: `${CONSENT_MONTHS} meses` },
        { label: 'Até', value: formatDate(authorizedUntil) },
      ];

  return (
    <>
      <View className="flex-row items-center gap-3.5">
        <BankTile mark={bank.mark} />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text serif weight="extrabold" size={24} leading={1.2} accessibilityRole="header">
            {renew ? `Renovar autorização do ${bank.name}` : `Conectar ${bank.name}`}
          </Text>
          <Text size={14} tone="muted">
            {renew
              ? `A atual termina em ${connection ? formatDate(connection.authorizedUntil, "d 'de' MMMM") : EMPTY}`
              : 'Pelo Open Finance, via Malvo'}
          </Text>
        </View>
      </View>
      <Text size={15} leading={1.55} tone="muted">
        {renew
          ? `Renovando agora, gastos, saldo e investimentos do ${bank.name} continuam chegando sem interrupção. Seu histórico não é apagado.`
          : 'Antes de abrir o app do banco, veja o que o Guará vai poder ler e por quanto tempo.'}
      </Text>
      <Heading>O que será compartilhado</Heading>
      <View>
        {MALVO_SCOPES.map((scope) => (
          <View
            key={scope.title}
            accessible
            accessibilityLabel={`${scope.title}: ${scope.detail}`}
            className="flex-row items-start gap-3 border-b border-border py-2.5"
          >
            <IconTile icon={scope.icon} tone="positive" />
            <View className="min-w-0 flex-1">
              <Text size={15} weight="bold" leading={1.4}>
                {scope.title}
              </Text>
              <Text size={13} tone="muted" leading={1.4}>
                {scope.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Heading>Por quanto tempo</Heading>
      <InfoGrid
        items={[
          ...duration,
          { label: 'Finalidade', value: CONSENT_PURPOSE },
          { label: 'Via', value: CONSENT_VIA },
        ]}
      />
      <InfoNote icon="lock" tone="negative" size={13}>
        <Text size={13} leading={1.5}>
          <Span weight="bold">Nunca:</Span> senha do banco, pagamentos, Pix ou transferências. O
          Guará só lê dados.
        </Text>
      </InfoNote>
      <Heading>Como funciona</Heading>
      <View className="gap-3">
        {steps.map((item, index) => (
          <View key={item.title} className="flex-row items-start gap-3">
            <View
              className={cn(
                'h-7 w-7 items-center justify-center rounded-full',
                index === 0 ? 'bg-brand' : 'bg-surface-muted',
              )}
            >
              <Text size={13} weight="bold" tone={index === 0 ? 'inverse' : 'muted'}>
                {index + 1}
              </Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text weight="semibold" leading={1.4}>
                {item.title}
              </Text>
              <Text size={13} tone="subtle" leading={1.4}>
                {item.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text size={13} leading={1.55} tone="subtle">
        Você pode revogar quando quiser em Meu perfil ou no app do {bank.name}. O Malvo é a empresa
        autorizada pelo Banco Central que faz a ponte com o banco.
      </Text>
    </>
  );
}

export interface ConnectingBodyProps {
  bank: BankOptionData;
  /** Steps finished (1 = authorization confirmed). */
  progress: number;
  authorizedAt: Date | null;
  findings: MalvoFindings | null;
}

/** "Conectando o Itaú…": the import step by step. */
export function ConnectingBody({ bank, progress, authorizedAt, findings }: ConnectingBodyProps) {
  const steps = [
    {
      title: `Autorização no ${bank.name}`,
      done: authorizedAt ? `Confirmada às ${formatTime(authorizedAt)}` : 'Confirmada',
    },
    { title: 'Buscando contas e cartões', done: findings?.foundSummary ?? 'Concluído' },
    { title: 'Buscando investimentos', done: findings?.investments ?? 'Concluído' },
    { title: 'Organizando lançamentos em categorias', done: findings?.transactions ?? 'Concluído' },
  ];
  return (
    <>
      <View className="items-center gap-3.5 pb-1 pt-3">
        <LoadingRing accessibilityLabel={`Conectando o ${bank.name}`} />
        <Text serif weight="extrabold" size={24} align="center" accessibilityRole="header">
          {`Conectando o ${bank.name}…`}
        </Text>
        <Text size={15} leading={1.55} tone="muted" align="center">
          Você autorizou no app do {bank.name}. Agora estamos buscando seus dados.
        </Text>
      </View>
      <View accessibilityRole="list" accessibilityLiveRegion="polite">
        {steps.map((item, index) => {
          const state = index < progress ? 'done' : index === progress ? 'active' : 'pending';
          const detail =
            state === 'done' ? item.done : state === 'active' ? 'Em andamento' : 'Aguardando';
          return (
            <View
              key={item.title}
              accessible
              accessibilityLabel={`${item.title}: ${detail}`}
              className="flex-row items-center gap-3 border-b border-border py-2.5"
            >
              {state === 'done' ? (
                <View className="h-7 w-7 items-center justify-center rounded-full bg-positive-muted">
                  <Icon name="check" size={16} strokeWidth={2.4} color={colors.positive.DEFAULT} />
                </View>
              ) : (
                <View
                  className={cn(
                    'h-7 w-7 rounded-full',
                    state === 'active'
                      ? 'border-[3px] border-brand'
                      : 'border-2 border-border-strong',
                  )}
                  style={
                    state === 'active' ? { borderRightColor: colors.surface.muted } : undefined
                  }
                />
              )}
              <View className="min-w-0 flex-1">
                <Text
                  weight={state === 'active' ? 'bold' : 'medium'}
                  tone={state === 'pending' ? 'subtle' : 'default'}
                  leading={1.4}
                >
                  {item.title}
                </Text>
                <Text size={13} tone="subtle" leading={1.4}>
                  {detail}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <InfoNote icon="clock" tone="info" size={13}>
        Isso pode levar até 1 minuto. Pode sair desta tela: avisamos quando terminar.
      </InfoNote>
    </>
  );
}

export interface SuccessBodyProps {
  bank: BankOptionData;
  mode: MalvoMode;
  findings: MalvoFindings | null;
  connections: readonly BankConnection[];
}

/** "Itaú conectado": what was found and the banks of the plan. */
export function SuccessBody({ bank, mode, findings, connections }: SuccessBodyProps) {
  const plan = usePlan();
  const renewed = mode === 'renew';
  return (
    <>
      <ResultHeader
        badge={<ResultBadge tone="positive" />}
        title={renewed ? `Autorização do ${bank.name} renovada` : `${bank.name} conectado`}
        description={
          renewed
            ? `Os dados do ${bank.name} continuam chegando sem interrupção.`
            : `Seus dados do ${bank.name} já estão no Guará e vão atualizar sozinhos várias vezes ao dia.`
        }
      />
      {renewed ? null : (
        <Card>
          <Heading>O que encontramos</Heading>
          <InfoGrid
            items={[
              { label: 'Contas', value: findings?.accounts ?? EMPTY },
              { label: 'Cartão', value: findings?.cards ?? EMPTY },
              { label: 'Investimentos', value: findings?.investments ?? EMPTY },
              {
                label: findings
                  ? `Lançamentos de ${formatDate(`${findings.transactionsMonth}-01`, 'MMMM')}`
                  : 'Lançamentos',
                value: findings?.transactions ?? EMPTY,
              },
            ]}
          />
        </Card>
      )}
      <Card>
        <View className="gap-0.5">
          <Heading>Bancos conectados</Heading>
          <Text size={13} tone="subtle">
            {connections.filter((item) => item.status !== 'paused').length} de {plan.bankLimit}{' '}
            conexões do plano {plan.name}
          </Text>
        </View>
        <View className="gap-2.5">
          {connections.map((item) => {
            const expiring = item.status === 'expiring';
            const paused = item.status === 'paused';
            const state = paused
              ? 'Pausado pelo plano'
              : expiring
                ? 'Renove em breve'
                : 'Funcionando';
            return (
              <View
                key={item.id}
                accessible
                accessibilityLabel={`${item.name}: ${state.toLowerCase()}, atualizado ${item.updatedAt}, autorização até ${formatDate(item.authorizedUntil)}`}
                className="flex-row items-center gap-3 rounded-18 border border-border bg-surface-input p-3.5"
              >
                <BankTile mark={item.initial} size={44} />
                <View className="min-w-0 flex-1">
                  <Text size={16} weight="bold" leading={1.3}>
                    {item.name}
                  </Text>
                  <View className="flex-row items-center gap-1.5">
                    <View
                      className={cn(
                        'h-2 w-2 rounded-full',
                        paused ? 'bg-foreground-subtle' : expiring ? 'bg-warning' : 'bg-positive',
                      )}
                    />
                    <Text
                      size={13}
                      weight="bold"
                      tone={paused ? 'muted' : expiring ? 'warning' : 'positive'}
                    >
                      {state}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text size={12} tone="subtle" leading={1.4}>
                    {item.updatedAt}
                  </Text>
                  <Text size={12} tone="subtle" leading={1.4}>
                    até {formatDate(item.authorizedUntil)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
      {!renewed && findings?.duplicateNotice ? (
        <InfoNote icon="copy" tone="warning" size={13}>
          {findings.duplicateNotice}
        </InfoNote>
      ) : null}
    </>
  );
}

export interface ErrorBodyProps {
  bank: BankOptionData;
  failedAt: Date | null;
  onSupport: () => void;
}

/** "Não deu para conectar o Itaú": nothing was shared, likely causes and the support code. */
export function ErrorBody({ bank, failedAt, onSupport }: ErrorBodyProps) {
  return (
    <>
      <ResultHeader
        badge={<ResultBadge tone="negative" />}
        title={`Não deu para conectar o ${bank.name}`}
        description="A autorização foi cancelada no app do banco. Nenhum dado foi compartilhado e nada mudou na sua conta."
      />
      <Card>
        <Heading>O que pode ter acontecido</Heading>
        <View>
          {MALVO_ERROR.reasons.map((reason, index) => (
            <View
              key={reason.detail}
              className={cn(
                'flex-row items-center gap-3 py-3',
                index < MALVO_ERROR.reasons.length - 1 && 'border-b border-border',
              )}
            >
              <IconTile icon={reason.icon} tone="neutral" />
              <View className="min-w-0 flex-1">
                <Text weight="medium" leading={1.35}>
                  {reason.title(bank.name)}
                </Text>
                <Text size={12} tone="subtle" leading={1.35}>
                  {reason.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
      <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
        {`Código para o suporte: ${MALVO_ERROR.code} · ${failedAt ? formatDateTime(failedAt) : EMPTY}`}
      </InfoNote>
      <View className="items-center">
        <LinkButton label="Falar com o suporte" onPress={onSupport} />
      </View>
    </>
  );
}

/** Content of the current step of the flow. */
export function MalvoBody({
  flow,
  connections,
  onSupport,
}: {
  flow: {
    bank: BankOptionData;
    mode: MalvoMode;
    step: 'authorize' | 'connecting' | 'success' | 'error';
    connection: BankConnection | null;
    authorizedUntil: string;
    progress: number;
    authorizedAt: Date | null;
    failedAt: Date | null;
    findings: MalvoFindings | null;
  };
  connections: readonly BankConnection[];
  onSupport: () => void;
}) {
  switch (flow.step) {
    case 'authorize':
      return (
        <ConsentBody
          bank={flow.bank}
          mode={flow.mode}
          connection={flow.connection}
          authorizedUntil={flow.authorizedUntil}
        />
      );
    case 'connecting':
      return (
        <ConnectingBody
          bank={flow.bank}
          progress={flow.progress}
          authorizedAt={flow.authorizedAt}
          findings={flow.findings}
        />
      );
    case 'success':
      return (
        <SuccessBody
          bank={flow.bank}
          mode={flow.mode}
          findings={flow.findings}
          connections={connections}
        />
      );
    case 'error':
      return <ErrorBody bank={flow.bank} failedAt={flow.failedAt} onSupport={onSupport} />;
  }
}
