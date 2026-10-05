import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui';

import { BankPicker, OnboardingFrame, StepIntro, StepProgress } from '../components';

/** Onboarding 1 · Conectar bancos (Open Finance). */
export function ConnectBanksStepScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState<string[]>(['nubank']);

  const next = () => router.push('/investor-profile');

  return (
    <OnboardingFrame
      topBar={{ leading: 'back', fallbackHref: '/sign-in' }}
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
        connected={connected}
        onChange={setConnected}
        planLabel="bancos do plano [NOME DO PLANO]. Dá para conectar mais depois."
      />
    </OnboardingFrame>
  );
}
