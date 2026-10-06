import { colors } from '@guara/ui-tokens';
import { EMPTY } from '@guara/utils';
import { useRouter, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { MataButton, MataSurface } from '@/components/illustrations';
import { ResponsiveGrid, SectionCard } from '@/components/layout';
import { Button, Icon, Text, type IconName } from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { useInvestorProfileStore } from '@/features/investor-profile';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { useUserStore } from '@/stores';

interface Step {
  key: string;
  label: string;
  caption: string;
  icon: IconName;
  done: boolean;
  /** `null` while the step waits for another one ("Depois de conectar um banco"). */
  href: Href | null;
}

const AFTER_CONNECT: { label: string; icon: IconName }[] = [
  { label: 'Ritmo do mês e previsão de fechamento', icon: 'trendingUp' },
  { label: 'Tetos de gasto e avisos', icon: 'target' },
  { label: 'Assinaturas detectadas', icon: 'repeat' },
];

function StepRow({ step, last }: { step: Step; last: boolean }) {
  const router = useRouter();
  const href = step.href;
  return (
    <Pressable
      accessibilityRole={href && !step.done ? 'link' : undefined}
      accessibilityLabel={`${step.label}, ${step.done ? 'feito' : step.caption}`}
      accessibilityState={{ disabled: !href && !step.done, checked: step.done }}
      disabled={!href || step.done}
      onPress={() => href && router.navigate(href)}
      className={cn(
        'flex-row items-center gap-3 py-3 active:opacity-80',
        !last && 'border-b border-border',
      )}
    >
      {step.done ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-positive-muted">
          <Icon name="check" size={16} color={colors.positive.DEFAULT} />
        </View>
      ) : (
        <View className="h-8 w-8 items-center justify-center rounded-12 bg-brand-muted">
          <Icon name={step.icon} size={16} color={colors.brand.DEFAULT} />
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.35}>
          {step.label}
        </Text>
        <Text size={12} tone="subtle" leading={1.35}>
          {step.done ? 'Feito' : step.caption}
        </Text>
      </View>
      {step.done || !href ? null : (
        <Icon name="chevronRight" size={18} color={colors.foreground.subtle} />
      )}
    </Pressable>
  );
}

/** Início of a user without a connected bank: empty balance, first steps and what comes next. */
export function NewUserHome() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const profile = useInvestorProfileStore((state) => state.profile);
  const name = useUserStore((state) => state.name);
  const steps: Step[] = [
    {
      key: 'bank',
      label: 'Conectar seu primeiro banco',
      caption: 'Saldo e gastos chegam sozinhos',
      icon: 'bank',
      done: false,
      href: '/connect-bank',
    },
    {
      key: 'profile',
      label: 'Responder o perfil de investidor',
      caption: '6 perguntas, 2 minutos',
      icon: 'user',
      done: Boolean(profile),
      href: '/account/investor-profile',
    },
    {
      key: 'budget',
      label: 'Criar um teto de gasto',
      caption: 'Depois de conectar um banco',
      icon: 'target',
      done: false,
      href: null,
    },
    {
      key: 'assistants',
      label: 'Conhecer os assistentes',
      caption: 'Feito',
      icon: 'users',
      done: true,
      href: '/assistants',
    },
  ];
  const done = steps.filter((step) => step.done).length;

  const balance = (
    <MataSurface
      veil={[0.85, 0.55, 0.1]}
      className="gap-2 rounded-24 border border-border-strong bg-hero p-5"
    >
      <Text size={14} style={{ color: colors.hero.label }}>
        Saldo em 0 bancos
      </Text>
      <Text
        serif
        weight="extrabold"
        size={34}
        leading={1.1}
        tracking={-0.01}
        accessibilityLabel="Saldo sem informação"
      >
        {EMPTY}
      </Text>
      <Text size={14} leading={1.5} style={{ color: colors.hero.caption }}>
        Conecte um banco para ver saldo, entradas e saídas do mês.
      </Text>
      <View className="mt-1 self-start">
        <MataButton
          label="Conectar banco"
          size={44}
          onPress={() => router.navigate('/connect-bank')}
        />
      </View>
    </MataSurface>
  );

  const capivara = (
    <AssistantNote
      assistant="capivara"
      actions={
        <Button
          variant="secondary"
          size="md"
          leftIcon="plus"
          className="h-10 px-4.5"
          onPress={() => router.navigate('/new-manual-asset')}
        >
          Cadastrar investimento
        </Button>
      }
    >
      {`Oi, ${name}! Enquanto você não conecta um banco, dá para cadastrar investimentos à mão ou testar o simulador com números seus.`}
    </AssistantNote>
  );

  const firstSteps = (
    <SectionCard
      title="Primeiros passos"
      description={`${done} de ${steps.length} ${done === 1 ? 'concluído' : 'concluídos'}`}
      titleSize={18}
      padding={18}
    >
      <View
        accessible
        accessibilityLabel={`${done} de ${steps.length} passos concluídos`}
        className="h-2 overflow-hidden rounded-4 bg-surface-muted"
      >
        <View
          className="h-2 rounded-4 bg-brand"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </View>
      <View>
        {steps.map((step, index) => (
          <StepRow key={step.key} step={step} last={index === steps.length - 1} />
        ))}
      </View>
    </SectionCard>
  );

  const afterConnect = (
    <SectionCard title="O que aparece depois de conectar" titleSize={17} padding={18}>
      <View>
        {AFTER_CONNECT.map((item, index) => (
          <View
            key={item.label}
            className={cn(
              'flex-row items-center gap-3 py-3',
              index < AFTER_CONNECT.length - 1 && 'border-b border-border',
            )}
          >
            <View className="h-8 w-8 items-center justify-center rounded-12 bg-surface-muted">
              <Icon name={item.icon} size={16} color={colors.foreground.muted} />
            </View>
            <Text weight="medium" className="min-w-0 flex-1">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );

  if (isTablet) {
    return (
      <>
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16}>
          {balance}
          {capivara}
        </ResponsiveGrid>
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch={false}>
          {firstSteps}
          {afterConnect}
        </ResponsiveGrid>
      </>
    );
  }
  return (
    <>
      {balance}
      {firstSteps}
      {capivara}
      {afterConnect}
    </>
  );
}
