import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, IconButton, Text } from '@/components/ui';

import { OnboardingFrame, RiskQuestion, StepProgress } from '../components';
import type { RiskAnswer } from '../data';

/** Onboarding 2 · Perfil de investidor (one question at a time). */
export function InvestorProfileStepScreen() {
  const router = useRouter();
  const [answer, setAnswer] = useState<RiskAnswer | null>('hold');

  const next = () => router.push('/assistants');
  const later = (
    <Button variant="ghost" onPress={next} accessibilityLabel="Responder depois" className="px-1.5">
      <Text size={15} weight="semibold" tone="muted" underline>
        Responder depois
      </Text>
    </Button>
  );

  return (
    <OnboardingFrame
      topBar={{
        leading: 'back',
        title: 'Perfil de investidor',
        fallbackHref: '/connect-banks',
        actions: (
          <IconButton icon="close" accessibilityLabel="Sair do questionário" onPress={next} />
        ),
      }}
      footer={
        <>
          {later}
          <Button variant="inverse" className="flex-1" onPress={next}>
            Continuar
          </Button>
        </>
      }
      tabletFooter={
        <>
          <Button variant="secondary" onPress={() => router.back()}>
            Voltar
          </Button>
          <View className="flex-1" />
          {later}
          <Button variant="inverse" onPress={next}>
            Continuar
          </Button>
        </>
      }
    >
      <StepProgress step={2} />
      <RiskQuestion answer={answer} onChange={setAnswer} />
    </OnboardingFrame>
  );
}
