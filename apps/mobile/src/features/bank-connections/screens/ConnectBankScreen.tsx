import { useRouter } from 'expo-router';

import { FormScreen, StepIntro } from '@/components/layout';
import { usePlan } from '@/stores';

import { BankPicker } from '../components';
import { useBankConnectionsStore } from '../store';

/** Conectar bancos from Meu perfil or Gastos: choose a bank and authorize it in the Malvo. */
export function ConnectBankScreen() {
  const plan = usePlan();
  const router = useRouter();
  const connections = useBankConnectionsStore((state) => state.connections);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/account'));

  return (
    <FormScreen
      chat={false}
      title="Conectar bancos"
      parents={[{ label: 'Meu perfil', href: '/account' }]}
      current="Conectar bancos"
      fallbackHref="/account"
      submit={{ label: 'Fechar', icon: 'check', onPress: close }}
    >
      <StepIntro
        title="Conecte seus bancos"
        description="Pelo Open Finance, via Malvo. Você autoriza no app do banco e revoga quando quiser."
      />
      <BankPicker
        connected={connections.filter((item) => item.status !== 'paused').map((item) => item.id)}
        onConnect={(bank) =>
          router.navigate({ pathname: '/malvo/[bankId]', params: { bankId: bank.id } })
        }
        connectedHint="Para desconectar, use Meu perfil."
        planLabel={`bancos do plano ${plan.name}. Para desconectar um banco, use Meu perfil.`}
      />
    </FormScreen>
  );
}
