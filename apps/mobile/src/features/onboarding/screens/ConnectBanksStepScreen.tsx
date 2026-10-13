import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { StepIntro } from '@/components/layout';
import { Button } from '@/components/ui';
import { BankPicker, useBankConnectionsStore } from '@/features/bank-connections';
import { usePlan } from '@/stores';

import { OnboardingFrame, StepProgress } from '../components';

/** Onboarding 1 · Conectar bancos (Open Finance). */
export function ConnectBanksStepScreen() {
  const plan = usePlan();
  const router = useRouter();
  const connections = useBankConnectionsStore((state) => state.connections);

  const next = () => router.push('/investor-profile');

  return (
    <OnboardingFrame
      topBar={{ leading: 'back', fallbackHref: '/welcome' }}
      footer={
        <>
          <Button variant="ghost" onPress={next}>
            Pular
          </Button>
          <Button fullWidth className="flex-1" onPress={next}>
            Continuar
          </Button>
        </>
      }
      tabletFooter={
        <>
          <Button variant="ghost" onPress={next}>
            Pular por agora
          </Button>
          <View className="flex-1" />
          <Button onPress={next}>Continuar</Button>
        </>
      }
    >
      <StepProgress step={1} />
      <StepIntro
        title="Conecte seus bancos"
        description="Pelo Open Finance, via Malvo. Você autoriza no app do banco e revoga quando quiser."
      />
      <BankPicker
        connected={connections.map((item) => item.id)}
        onConnect={(bank) =>
          router.push({ pathname: '/connect/[bankId]', params: { bankId: bank.id } })
        }
        planLabel={`bancos do plano ${plan.name}. Dá para conectar mais depois.`}
      />
    </OnboardingFrame>
  );
}
