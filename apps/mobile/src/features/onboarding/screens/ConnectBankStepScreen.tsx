import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState, toast } from '@/components/feedback';
import {
  BankAppSheet,
  MalvoActions,
  MalvoBody,
  useBankConnectionsStore,
  useMalvoFlow,
} from '@/features/bank-connections';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { OnboardingFrame, StepProgress } from '../components';

/** Onboarding 1 · authorizing one bank through the Malvo (consent → bank app → result). */
export function ConnectBankStepScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { bankId } = useLocalSearchParams<{ bankId: string }>();
  const flow = useMalvoFlow(bankId, 'connect');
  const connections = useBankConnectionsStore((state) => state.connections);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/connect-banks'));
  const next = () => router.replace('/investor-profile');
  const topBar = { title: 'Conectar banco', leading: 'close' as const, onLeadingPress: back };

  if (!flow.bank) {
    return (
      <OnboardingFrame topBar={topBar}>
        <EmptyState
          icon="search"
          title="Banco não encontrado"
          description="Volte e escolha um banco da lista."
          action={{ label: 'Ver bancos', onPress: back }}
        />
      </OnboardingFrame>
    );
  }

  const bank = flow.bank;
  const actions = (wide: boolean) => (
    <MalvoActions
      flow={flow}
      wide={wide}
      onClose={back}
      onDone={next}
      onLeave={() => {
        flow.finishInBackground();
        toast.info(`Avisamos quando o ${bank.name} terminar de conectar.`);
        next();
      }}
    />
  );

  return (
    <>
      <OnboardingFrame topBar={topBar} footer={actions(false)} tabletFooter={actions(true)}>
        {isTablet ? <StepProgress step={1} /> : null}
        <MalvoBody
          flow={{ ...flow, bank }}
          connections={connections}
          onSupport={() => toast.info('O suporte responde pelo chat depois do cadastro.')}
        />
      </OnboardingFrame>
      <BankAppSheet flow={flow} />
    </>
  );
}
