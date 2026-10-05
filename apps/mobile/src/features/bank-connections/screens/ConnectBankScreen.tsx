import { useRouter } from 'expo-router';

import { FormScreen, StepIntro } from '@/components/layout';

import { BankPicker } from '../components';
import { PLAN } from '../data';
import { useBankConnectionsStore } from '../store';

/** Conectar bancos from Meu perfil or Gastos: choose a bank and authorize it in the Malvo. */
export function ConnectBankScreen() {
  const router = useRouter();
  const connections = useBankConnectionsStore((state) => state.connections);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/account'));

  return (
    <FormScreen
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
        connected={connections.map((item) => item.id)}
        onConnect={(bank) =>
          router.navigate({ pathname: '/malvo/[bankId]', params: { bankId: bank.id } })
        }
        connectedHint="Para desconectar, use Meu perfil."
        planLabel={`bancos do plano ${PLAN.name}. Para desconectar um banco, use Meu perfil.`}
      />
    </FormScreen>
  );
}
