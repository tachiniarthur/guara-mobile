import { useRouter } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/components/feedback';
import { FormScreen } from '@/components/layout';
import { BANK_CONNECTIONS } from '@/features/account';
import { BankPicker, ONBOARDING_BANKS, StepIntro } from '@/features/onboarding';

/** Banks already connected (removed only in Meu perfil). */
const CONNECTED = BANK_CONNECTIONS.map((bank) => bank.id);

/** Conectar bancos from Meu perfil or Gastos: the onboarding step without the progress. */
export function ConnectBankScreen() {
  const router = useRouter();
  const [connected, setConnected] = useState<string[]>(CONNECTED);
  const added = ONBOARDING_BANKS.filter(
    (bank) => connected.includes(bank.id) && !CONNECTED.includes(bank.id),
  );

  const finish = () => {
    if (added.length > 0) {
      const names = added.map((bank) => bank.name).join(' e ');
      toast.success(
        `${names} ${added.length === 1 ? 'conectado' : 'conectados'} pelo Open Finance`,
      );
    }
    if (router.canGoBack()) router.back();
    else router.replace('/account');
  };

  return (
    <FormScreen
      title="Conectar bancos"
      parents={[{ label: 'Meu perfil', href: '/account' }]}
      current="Conectar bancos"
      fallbackHref="/account"
      submit={{ label: added.length > 0 ? 'Concluir' : 'Fechar', icon: 'check', onPress: finish }}
    >
      <StepIntro
        title="Conecte seus bancos"
        description="Pelo Open Finance, via Malvo. Você autoriza no app do banco e revoga quando quiser."
      />
      <BankPicker
        connected={connected}
        onChange={setConnected}
        locked={CONNECTED}
        planLabel="bancos do seu plano. Para desconectar um banco, use Meu perfil."
      />
    </FormScreen>
  );
}
