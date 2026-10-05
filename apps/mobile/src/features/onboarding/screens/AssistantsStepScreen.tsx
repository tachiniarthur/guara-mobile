import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ResponsiveGrid } from '@/components/layout';
import { Button, Checkbox, Text } from '@/components/ui';
import { ASSISTANTS, AssistantAvatar, ONBOARDING_ASSISTANT_ORDER } from '@/features/chat';
import { useAuth } from '@/providers';

import { OnboardingFrame, StepIntro, StepProgress } from '../components';

/** Onboarding 3 · Assistentes e avisos. */
export function AssistantsStepScreen() {
  const router = useRouter();
  const { setStatus } = useAuth();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);

  const finish = () => setStatus('signedIn');

  return (
    <OnboardingFrame
      topBar={{ leading: 'back', fallbackHref: '/investor-profile' }}
      footer={
        <Button fullWidth className="flex-1" onPress={finish}>
          Ir para o painel
        </Button>
      }
      tabletFooter={
        <>
          <Button variant="secondary" onPress={() => router.back()}>
            Voltar
          </Button>
          <View className="flex-1" />
          <Button onPress={finish}>Ir para o painel</Button>
        </>
      }
    >
      <StepProgress step={3} />
      <StepIntro
        title="Conheça seus assistentes"
        description="Você não precisa escolher nada: é só perguntar que a Capivara chama o assistente certo. Para falar com um específico, digite @ no chat."
      />
      <ResponsiveGrid columns={{ phone: 1, tablet: 2 }} gap={10}>
        {ONBOARDING_ASSISTANT_ORDER.map((id) => {
          const meta = ASSISTANTS[id];
          return (
            <View
              key={id}
              className="h-full flex-row items-start gap-3.5 rounded-20 border border-border bg-surface-input p-4"
            >
              <AssistantAvatar assistant={id} size={46} />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text size={15} weight="bold" leading={1.4}>
                  {meta.name}
                </Text>
                <Text size={14} tone="muted" leading={1.4}>
                  {meta.description}
                </Text>
              </View>
            </View>
          );
        })}
      </ResponsiveGrid>
      <View accessibilityLabel="Como quer ser avisado?">
        <Text size={16} weight="bold" className="mb-1.5">
          Como quer ser avisado?
        </Text>
        <Checkbox
          checked={push}
          onChange={setPush}
          label="Notificação no celular"
          description="Tetos, alertas de preço e compras fora do padrão"
        />
        <Checkbox
          checked={email}
          onChange={setEmail}
          label="E-mail"
          description="Os mesmos avisos, na sua caixa de entrada"
        />
      </View>
    </OnboardingFrame>
  );
}
