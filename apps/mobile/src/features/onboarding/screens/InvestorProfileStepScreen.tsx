import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { Button, IconButton, Text } from '@/components/ui';
import {
  PROFILE_LABELS,
  ProfileQuestionView,
  ProfileResult,
  useInvestorProfileStore,
  useQuestionnaire,
  type ProfileAnswers,
} from '@/features/investor-profile';

import { OnboardingFrame, StepProgress } from '../components';

/** Onboarding 2 · Perfil de investidor: six questions, one at a time, then the result. */
export function InvestorProfileStepScreen() {
  const router = useRouter();
  const save = useInvestorProfileStore((state) => state.save);
  const flow = useQuestionnaire();

  const skip = () => router.push('/assistants');
  const back = () => {
    if (!flow.back()) router.back();
  };
  const finish = () => {
    save(flow.type, flow.answers as Required<ProfileAnswers>);
    toast.success(`Perfil ${PROFILE_LABELS[flow.type]} salvo`);
    router.push('/assistants');
  };

  const later = (
    <Button variant="ghost" onPress={skip} accessibilityLabel="Responder depois" className="px-1.5">
      <Text size={15} weight="semibold" tone="muted" underline>
        Responder depois
      </Text>
    </Button>
  );

  const phoneActions = flow.isResult ? (
    <>
      <Button variant="secondary" onPress={flow.restart}>
        Refazer
      </Button>
      <Button variant="inverse" className="flex-1" onPress={finish}>
        Continuar
      </Button>
    </>
  ) : (
    <>
      {later}
      <Button variant="inverse" className="flex-1" disabled={!flow.answer} onPress={flow.next}>
        Continuar
      </Button>
    </>
  );

  const tabletActions = flow.isResult ? (
    <>
      <Button variant="secondary" onPress={flow.restart}>
        Refazer
      </Button>
      <View className="flex-1" />
      <Button variant="inverse" onPress={finish}>
        Continuar
      </Button>
    </>
  ) : (
    <>
      <Button variant="secondary" onPress={back}>
        Voltar
      </Button>
      <View className="flex-1" />
      {later}
      <Button variant="inverse" disabled={!flow.answer} onPress={flow.next}>
        Continuar
      </Button>
    </>
  );

  return (
    <OnboardingFrame
      topBar={{
        leading: 'back',
        title: 'Perfil de investidor',
        onLeadingPress: back,
        actions: flow.isResult ? undefined : (
          <IconButton icon="close" accessibilityLabel="Sair do questionário" onPress={skip} />
        ),
      }}
      footer={phoneActions}
      tabletFooter={tabletActions}
    >
      <StepProgress step={2} />
      {flow.isResult ? (
        <ProfileResult type={flow.type} answers={flow.answers} />
      ) : (
        <ProfileQuestionView
          question={flow.question!}
          index={flow.step + 1}
          total={flow.total}
          answer={flow.answer}
          onChange={flow.select}
        />
      )}
    </OnboardingFrame>
  );
}
