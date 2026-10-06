import { colors } from '@guara/ui-tokens';
import { cents, formatCents, formatDate } from '@guara/utils';
import { useState } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Icon,
  InfoNote,
  LinkButton,
  OptionSheet,
  SegmentedControl,
  Text,
} from '@/components/ui';
import { PLANS, PLAN_COMPARISON, planById, type Plan } from '@/constants/plans';
import { useBankConnectionsStore } from '@/features/bank-connections';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';
import { usePlan, useSubscriptionStore, type Billing } from '@/stores';

type Dialog =
  | { kind: 'upgrade'; plan: Plan }
  | { kind: 'downgrade'; plan: Plan }
  | { kind: 'keepBank'; plan: Plan }
  | { kind: 'cancel' }
  | null;

const date = (value: string) => formatDate(value);
const shortDate = (value: string) => formatDate(value, 'dd/MM');

function Price({ plan, billing }: { plan: Plan; billing: Billing }) {
  if (plan.monthly === null || plan.yearly === null) {
    return (
      <View className="gap-0.5">
        <Text serif weight="extrabold" size={30} leading={1.1} tracking={-0.01}>
          Grátis
        </Text>
        <Text size={13} tone="subtle">
          para sempre
        </Text>
      </View>
    );
  }
  const yearly = billing === 'yearly';
  return (
    <View className="gap-0.5">
      <Text serif weight="extrabold" size={30} leading={1.1} tracking={-0.01}>
        {formatCents(yearly ? plan.yearly : plan.monthly)}
        <Text weight="medium" size={16} tone="muted">
          {yearly ? ' /ano' : ' /mês'}
        </Text>
      </Text>
      <Text size={13} tone="subtle">
        {yearly
          ? `equivale a ${formatCents(cents(Math.round(plan.yearly / 12)))} por mês`
          : `ou ${formatCents(plan.yearly)} por ano`}
      </Text>
    </View>
  );
}

function PlanCard({
  plan,
  current,
  billing,
  scheduledHere,
  renewsOn,
  needsBankChoice,
  action,
}: {
  plan: Plan;
  current: boolean;
  billing: Billing;
  scheduledHere: boolean;
  renewsOn: string;
  needsBankChoice: boolean;
  action: { label: string; primary: boolean; onPress: (() => void) | null };
}) {
  return (
    <View
      className="min-w-0 flex-1 gap-3.5 rounded-24 bg-surface p-5"
      style={{
        borderWidth: current ? 2 : 1,
        borderColor: current ? colors.brand.DEFAULT : colors.border.DEFAULT,
      }}
    >
      <View className="flex-row items-center justify-between gap-2.5">
        <Text serif weight="bold" size={22} accessibilityRole="header" className="flex-1">
          {plan.name}
        </Text>
        {current ? <Badge label="Seu plano" tone="brand" icon="check" /> : null}
        {scheduledHere ? <Badge label={`A partir de ${shortDate(renewsOn)}`} tone="info" /> : null}
      </View>
      <Price plan={plan} billing={billing} />
      <View className="gap-2 rounded-14 bg-surface-input px-3.5 py-3">
        <View className="flex-row items-center gap-2">
          <Icon name="bank" size={18} color={colors.foreground.DEFAULT} />
          <Text weight="bold">{plan.banksLabel}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Icon name="message" size={18} color={colors.foreground.muted} />
          <Text size={14} tone="muted" className="flex-1">
            {`${plan.questions.toLocaleString('pt-BR')} perguntas por mês aos assistentes`}
          </Text>
        </View>
      </View>
      <View className="flex-1 gap-2">
        {plan.features.map((feature) => (
          <View key={feature} className="flex-row items-start gap-2">
            <View style={{ marginTop: 2 }}>
              <Icon name="check" size={16} color={colors.positive.DEFAULT} />
            </View>
            <Text size={14} tone="muted" className="flex-1">
              {feature}
            </Text>
          </View>
        ))}
      </View>
      {needsBankChoice ? (
        <InfoNote icon="alertTriangle" tone="warning" size={13} iconColor={colors.warning.DEFAULT}>
          Para mudar, você escolhe qual banco fica conectado. Os outros param de atualizar.
        </InfoNote>
      ) : null}
      <Button
        variant={action.primary ? 'primary' : 'secondary'}
        size="lg"
        fullWidth
        disabled={!action.onPress}
        onPress={action.onPress ?? undefined}
        accessibilityLabel={`${action.label}, plano ${plan.name}`}
      >
        {action.label}
      </Button>
    </View>
  );
}

/** "Planos": usage of the current plan, billing, the three plans and the cancellation. */
export function PlanScreen() {
  const { isTablet } = useBreakpoint();
  const plan = usePlan();
  const subscription = useSubscriptionStore();
  const connections = useBankConnectionsStore((state) => state.connections);
  const active = connections.filter((item) => item.status !== 'paused');
  const [billing, setBilling] = useState<Billing>(subscription.billing);
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const scheduled = subscription.scheduled ? planById(subscription.scheduled.planId) : null;
  const month = formatDate(`${subscription.usageMonth}-01`, 'MMMM');
  const rank = (item: Plan) => PLANS.indexOf(item);

  const actionFor = (item: Plan) => {
    if (item.id === plan.id) {
      if (billing !== subscription.billing && item.monthly !== null) {
        return {
          label: billing === 'yearly' ? 'Mudar para cobrança anual' : 'Mudar para cobrança mensal',
          primary: true,
          onPress: () => {
            subscription.setPlan(item.id, billing);
            toast.success(
              billing === 'yearly'
                ? 'Cobrança anual a partir de hoje'
                : 'Cobrança mensal a partir da renovação',
            );
          },
        };
      }
      return {
        label: 'Plano atual',
        primary: false,
        onPress: () => toast.info(`Você já está no plano ${item.name}.`),
      };
    }
    if (scheduled?.id === item.id) {
      return {
        label: `Muda em ${shortDate(subscription.renewsOn)}`,
        primary: false,
        onPress: null,
      };
    }
    const upgrade = rank(item) > rank(plan);
    return {
      label: `Mudar para o ${item.name}`,
      primary: upgrade,
      onPress: () => {
        if (upgrade) setDialog({ kind: 'upgrade', plan: item });
        else if (active.length > item.bankLimit) setDialog({ kind: 'keepBank', plan: item });
        else setDialog({ kind: 'downgrade', plan: item });
      },
    };
  };

  const cards = (
    isTablet ? PLANS : [plan, ...[...PLANS].reverse().filter((item) => item.id !== plan.id)]
  ).map((item) => (
    <PlanCard
      key={item.id}
      plan={item}
      current={item.id === plan.id}
      billing={billing}
      scheduledHere={scheduled?.id === item.id}
      renewsOn={subscription.renewsOn}
      needsBankChoice={
        item.id !== plan.id && scheduled?.id !== item.id && active.length > item.bankLimit
      }
      action={actionFor(item)}
    />
  ));

  const scheduledNote =
    scheduled && subscription.scheduled ? (
      <View className="gap-2.5">
        <InfoNote icon="clock" tone="info" size={13}>
          {`Seu plano ${plan.name} vale até ${date(subscription.renewsOn)}. Depois disso, você passa para o ${scheduled.name}${
            subscription.scheduled.keepBankId
              ? ` e só o ${connections.find((item) => item.id === subscription.scheduled?.keepBankId)?.name ?? 'banco escolhido'} continua atualizando.`
              : '.'
          }`}
        </InfoNote>
        <Button
          variant="secondary"
          size="md"
          className="h-10 self-start px-4.5"
          onPress={() => {
            subscription.keepPlan();
            toast.success(`Você continua no plano ${plan.name}`);
          }}
        >
          {`Manter o plano ${plan.name}`}
        </Button>
      </View>
    ) : null;

  const usage = (
    <SectionCard
      title={`Seu uso no plano ${plan.name}`}
      description={
        plan.monthly === null
          ? 'Plano gratuito'
          : `Assinatura ${subscription.billing === 'yearly' ? 'anual' : 'mensal'} · renova em ${date(subscription.renewsOn)}`
      }
      titleSize={18}
      padding={20}
    >
      <View className="gap-2">
        <View className="flex-row items-center gap-2.5">
          <Text size={14} tone="muted" className="flex-1">
            Bancos conectados
          </Text>
          <Text weight="bold">{`${active.length} de ${plan.bankLimit}`}</Text>
        </View>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${active.length} de ${plan.bankLimit} bancos`}
          className="h-2 flex-row gap-1"
        >
          {Array.from({ length: plan.bankLimit }, (_, index) => (
            <View
              key={index}
              className={
                index < active.length
                  ? 'flex-1 rounded-4 bg-positive'
                  : 'flex-1 rounded-4 bg-border'
              }
            />
          ))}
        </View>
      </View>
      <View className="gap-2">
        <View className="flex-row items-center gap-2.5">
          <Text size={14} tone="muted" className="flex-1">
            {`Perguntas aos assistentes em ${month}`}
          </Text>
          <Text weight="bold">{`${subscription.questionsUsed} de ${plan.questions.toLocaleString('pt-BR')}`}</Text>
        </View>
        <View className="h-2 overflow-hidden rounded-4 bg-surface-muted">
          <View
            className="h-2 rounded-4 bg-info"
            style={{
              width: `${Math.min(100, Math.round((subscription.questionsUsed / plan.questions) * 100))}%`,
            }}
          />
        </View>
      </View>
      {scheduledNote}
    </SectionCard>
  );

  const billingToggle = (
    <SegmentedControl
      accessibilityLabel="Cobrança"
      track="input"
      size="sm"
      textSize={14}
      fill
      value={billing}
      onChange={setBilling}
      options={[
        { value: 'monthly', label: 'Mensal' },
        { value: 'yearly', label: 'Anual · 2 meses grátis' },
      ]}
    />
  );
  const prorationNote = `A mudança vale na hora. Ao subir de plano, você paga só a diferença proporcional até ${shortDate(subscription.renewsOn)}. Ao descer, o plano atual vale até o fim do período pago.`;

  const cancelLink =
    plan.monthly !== null && !scheduled ? (
      <View className="items-center">
        <LinkButton
          label="Cancelar assinatura"
          chevron={false}
          onPress={() => setDialog({ kind: 'cancel' })}
        />
      </View>
    ) : null;

  const comparison = isTablet ? (
    <SectionCard title="Comparar recursos" titleSize={20} padding={20}>
      <DataTable
        caption="Comparar recursos dos planos"
        cellPadding={10}
        columns={[
          { key: 'feature', label: 'Recurso', flex: 1.6, hideLabel: true },
          ...PLANS.map((item) => ({ key: item.id, label: item.name })),
        ]}
        rows={PLAN_COMPARISON.map((row) => ({
          key: row.label,
          cells: [
            <Text key="label" size={14} tone="muted">
              {row.label}
            </Text>,
            ...row.values.map((value, index) => (
              <Text
                key={PLANS[index]!.id}
                size={14}
                weight={PLANS[index]!.id === plan.id ? 'bold' : 'regular'}
              >
                {value}
              </Text>
            )),
          ],
        }))}
      />
    </SectionCard>
  ) : null;

  const dialogs = (
    <>
      <ConfirmDialog
        open={dialog?.kind === 'upgrade'}
        title={dialog?.kind === 'upgrade' ? `Mudar para o ${dialog.plan.name}?` : ''}
        message={`A mudança vale na hora. Você paga só a diferença proporcional até ${shortDate(subscription.renewsOn)}.`}
        confirmLabel="Mudar de plano"
        onCancel={close}
        onConfirm={() => {
          if (dialog?.kind !== 'upgrade') return;
          subscription.setPlan(dialog.plan.id, billing);
          toast.success(`Agora você está no plano ${dialog.plan.name}`);
          close();
        }}
      />
      <ConfirmDialog
        open={dialog?.kind === 'downgrade'}
        title={dialog?.kind === 'downgrade' ? `Mudar para o ${dialog.plan.name}?` : ''}
        message={`O plano ${plan.name} vale até ${date(subscription.renewsOn)}. Depois disso, você passa para o ${dialog?.kind === 'downgrade' ? dialog.plan.name : ''}.`}
        confirmLabel="Agendar mudança"
        onCancel={close}
        onConfirm={() => {
          if (dialog?.kind !== 'downgrade') return;
          subscription.schedule(dialog.plan.id, null);
          toast.success(`Mudança agendada para ${date(subscription.renewsOn)}`);
          close();
        }}
      />
      <OptionSheet
        open={dialog?.kind === 'keepBank'}
        onClose={close}
        title="Qual banco fica conectado?"
        value=""
        options={active.map((item) => ({
          value: item.id,
          label: item.name,
          description: 'Continua atualizando sozinho',
        }))}
        onChange={(bankId) => {
          if (dialog?.kind !== 'keepBank') return;
          subscription.schedule(dialog.plan.id, bankId);
          toast.success(`Mudança agendada para ${date(subscription.renewsOn)}`);
        }}
      />
      <ConfirmDialog
        open={dialog?.kind === 'cancel'}
        title="Cancelar assinatura?"
        message={`O plano ${plan.name} vale até ${date(subscription.renewsOn)}. Depois disso, sua conta passa para o Essencial, que é grátis.`}
        confirmLabel="Cancelar assinatura"
        cancelLabel="Manter plano"
        destructive
        onCancel={close}
        onConfirm={() => {
          const essential = PLANS[0]!;
          subscription.schedule(
            essential.id,
            active.length > essential.bankLimit ? (active[0]?.id ?? null) : null,
          );
          toast.info(
            `Assinatura cancelada. O plano ${plan.name} vale até ${date(subscription.renewsOn)}.`,
          );
          close();
        }}
      />
    </>
  );

  if (isTablet) {
    return (
      <View className="flex-1">
        <Screen contentClassName="gap-5 pb-32">
          <PageHeader
            title="Planos"
            breadcrumb={{
              parents: [
                { label: 'Meu perfil', href: '/account' },
                { label: 'Bancos conectados', href: '/account' },
              ],
              current: 'Planos',
            }}
          />
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16}>
            {usage}
            <SectionCard
              title="Cobrança"
              description="Anual sai por 10 meses de mensalidade"
              titleSize={18}
              padding={20}
            >
              {billingToggle}
              <Text size={13} leading={1.55} tone="subtle">
                {`A mudança vale na hora. Ao subir, você paga só a diferença proporcional até ${shortDate(subscription.renewsOn)}.`}
              </Text>
            </SectionCard>
          </ResponsiveGrid>
          <View className="flex-row gap-3.5">{cards}</View>
          {comparison}
          {cancelLink}
        </Screen>
        <ChatFab />
        {dialogs}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        header={<TopBar title="Planos" fallbackHref="/account" />}
        contentClassName="gap-4 pt-1"
      >
        {usage}
        {billingToggle}
        {cards}
        <Text size={13} leading={1.55} tone="subtle">
          {prorationNote}
        </Text>
        {cancelLink}
      </Screen>
      {dialogs}
    </View>
  );
}
