import { useRouter } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/components/feedback';
import { FormScreen } from '@/components/layout';
import { RiskQuestion, type RiskAnswer } from '@/features/onboarding';

/** Refazer o perfil de investidor (the onboarding questionnaire, from Meu perfil or Investimentos). */
export function InvestorProfileScreen() {
  const router = useRouter();
  // Current answer of the profile (Moderado).
  const [answer, setAnswer] = useState<RiskAnswer | null>('hold');

  const save = () => {
    toast.success('Perfil de investidor atualizado');
    if (router.canGoBack()) router.back();
    else router.replace('/account');
  };

  return (
    <FormScreen
      title="Perfil de investidor"
      parents={[{ label: 'Meu perfil', href: '/account' }]}
      current="Perfil de investidor"
      fallbackHref="/account"
      submit={{ label: 'Salvar perfil', icon: 'check', onPress: save, disabled: answer === null }}
    >
      <RiskQuestion answer={answer} onChange={setAnswer} />
    </FormScreen>
  );
}
