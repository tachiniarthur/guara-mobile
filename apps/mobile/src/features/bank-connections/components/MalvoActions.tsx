import { View } from 'react-native';

import { Button, Sheet, Text } from '@/components/ui';

import type { MalvoFlow } from '../hooks/useMalvoFlow';

export interface MalvoActionsProps {
  flow: MalvoFlow;
  /** Tablet: buttons sized for the card row (52 tall, no stretching of the secondary one). */
  wide: boolean;
  /** Close the flow (Cancelar, Outro banco, Conectar outro). */
  onClose: () => void;
  /** After a successful connection ("Continuar"). */
  onDone: () => void;
  /** "Continuar usando o app" while importing. */
  onLeave: () => void;
}

/** Bottom actions of each step of the Malvo flow. */
export function MalvoActions({ flow, wide, onClose, onDone, onLeave }: MalvoActionsProps) {
  const name = flow.bank?.name ?? 'banco';
  const main = wide ? undefined : 'flex-1';

  switch (flow.step) {
    case 'authorize':
      return (
        <>
          <Button variant="ghost" onPress={onClose}>
            Cancelar
          </Button>
          {wide ? <View className="flex-1" /> : null}
          <Button leftIcon="externalLink" className={main} onPress={flow.openBankApp}>
            {flow.mode === 'renew' ? `Renovar no ${name}` : `Continuar para o ${name}`}
          </Button>
        </>
      );
    case 'connecting':
      return (
        <Button variant="secondary" fullWidth={!wide} className={main} onPress={onLeave}>
          Continuar usando o app
        </Button>
      );
    case 'success':
      return (
        <>
          {flow.mode === 'connect' ? (
            <Button variant="secondary" onPress={onClose}>
              {wide ? 'Conectar outro banco' : 'Conectar outro'}
            </Button>
          ) : null}
          {wide ? <View className="flex-1" /> : null}
          <Button className={main} onPress={onDone}>
            Continuar
          </Button>
        </>
      );
    case 'error':
      return (
        <>
          <Button variant="secondary" onPress={onClose}>
            {wide ? 'Escolher outro banco' : 'Outro banco'}
          </Button>
          {wide ? <View className="flex-1" /> : null}
          <Button leftIcon="retry" className={main} onPress={flow.retry}>
            Tentar de novo
          </Button>
        </>
      );
  }
}

/**
 * Stand-in for the bank app the Malvo opens. Without the API there is no real consent screen,
 * so the user chooses what the bank answers.
 */
export function BankAppSheet({ flow }: { flow: MalvoFlow }) {
  const name = flow.bank?.name ?? 'banco';
  return (
    <Sheet open={flow.bankAppOpen} onClose={flow.closeBankApp} title={`App do ${name}`}>
      <View className="gap-4">
        <Text tone="muted" leading={1.5}>
          Aqui o Malvo abre o app do {name} para você entrar com sua senha e autorizar. Nesta versão
          de testes, escolha a resposta do banco.
        </Text>
        <Button fullWidth leftIcon="check" onPress={flow.authorize}>
          {`Autorizar no ${name}`}
        </Button>
        <Button fullWidth variant="secondary" onPress={flow.fail}>
          {`Cancelar no ${name}`}
        </Button>
      </View>
    </Sheet>
  );
}
