import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, toast } from '@/components/feedback';
import { PageHeader, Screen, StickyFooter, TopBar } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { BankAppSheet, MalvoActions, MalvoBody } from '../components';
import { useMalvoFlow, type MalvoMode } from '../hooks/useMalvoFlow';
import { useBankConnectionsStore } from '../store';

/** Connect a bank (or renew its consent) through the Malvo, from inside the app. */
export function MalvoScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const params = useLocalSearchParams<{ bankId: string; mode?: string }>();
  const mode: MalvoMode = params.mode === 'renew' ? 'renew' : 'connect';
  const flow = useMalvoFlow(params.bankId, mode);
  const connections = useBankConnectionsStore((state) => state.connections);
  const title = mode === 'renew' ? 'Renovar autorização' : 'Conectar banco';
  const close = () => (router.canGoBack() ? router.back() : router.replace('/account'));
  const support = () => toast.info('O suporte responde pelo chat em Meu perfil.');

  if (!flow.bank) {
    return (
      <Screen header={<TopBar title={title} leading="close" fallbackHref="/account" />}>
        <EmptyState
          icon="search"
          title="Banco não encontrado"
          description="Escolha um banco na lista de Conectar bancos."
          action={{ label: 'Ver bancos', onPress: () => router.replace('/connect-bank') }}
        />
      </Screen>
    );
  }

  const bank = flow.bank;
  const actions = (wide: boolean) => (
    <MalvoActions
      flow={flow}
      wide={wide}
      onClose={close}
      onDone={close}
      onLeave={() => {
        flow.finishInBackground();
        toast.info(`Avisamos quando o ${bank.name} terminar de conectar.`);
        close();
      }}
    />
  );
  const body = <MalvoBody flow={{ ...flow, bank }} connections={connections} onSupport={support} />;

  if (isTablet) {
    return (
      <View className="flex-1">
        <Screen contentClassName="pb-16">
          <PageHeader
            title={title}
            breadcrumb={{
              parents: [
                { label: 'Meu perfil', href: '/account' },
                { label: 'Bancos conectados', href: '/account' },
              ],
              current: mode === 'renew' ? `Renovar ${bank.name}` : `Conectar ${bank.name}`,
            }}
          />
          <View className="w-full max-w-[640px] gap-[18px] rounded-24 border border-border bg-surface p-6">
            {body}
            <View className="flex-row items-center gap-2.5 pt-2">{actions(true)}</View>
          </View>
        </Screen>
        <BankAppSheet flow={flow} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        header={<TopBar title={title} leading="close" fallbackHref="/account" />}
        footer={<StickyFooter>{actions(false)}</StickyFooter>}
        centered={flow.step === 'connecting' || flow.step === 'error'}
        contentClassName="gap-[18px] pt-2"
      >
        {body}
      </Screen>
      <BankAppSheet flow={flow} />
    </View>
  );
}
