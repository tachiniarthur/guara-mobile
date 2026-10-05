import { colors } from '@guara/ui-tokens';
import { View } from 'react-native';

import { Button, Icon, Span, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { BankConnection } from '../data';

export interface BankConnectionCardProps {
  bank: BankConnection;
  onRefresh: () => void;
  onRenew: () => void;
  onShowScopes: () => void;
  onDisconnect: () => void;
}

/** Status, scopes and validity of one Open Finance connection, with its actions. */
export function BankConnectionCard({
  bank,
  onRefresh,
  onRenew,
  onShowScopes,
  onDisconnect,
}: BankConnectionCardProps) {
  const expiring = bank.status === 'expiring';

  return (
    <View
      className={cn(
        'flex-1 gap-3.5 rounded-18 border bg-surface-input p-4',
        expiring ? 'border-warning-border' : 'border-border',
      )}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-12 border border-border bg-background">
          <Text serif weight="bold" size={17}>
            {bank.initial}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text size={16} weight="bold" leading={1.3}>
            {bank.name}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View className={cn('h-2 w-2 rounded-full', expiring ? 'bg-warning' : 'bg-positive')} />
            <Text size={13} weight="bold" tone={expiring ? 'warning' : 'positive'} leading={1.3}>
              {expiring ? 'Renove em breve' : 'Funcionando'}
            </Text>
          </View>
        </View>
      </View>
      <View
        className={cn(
          'flex-row items-start gap-2.5 rounded-14 px-3.5 py-3',
          expiring ? 'bg-warning-muted' : 'bg-positive-muted',
        )}
      >
        <View style={{ marginTop: 1 }}>
          <Icon
            name={expiring ? 'alertTriangle' : 'checkThin'}
            size={16}
            color={expiring ? colors.warning.DEFAULT : colors.positive.DEFAULT}
          />
        </View>
        <Text size={13} className="flex-1">
          {expiring ? (
            <>
              A autorização termina em <Span weight="bold">{bank.expiresOn}</Span>. Depois disso,
              gastos e saldo do {bank.name} param de atualizar. Renovar leva 1 minuto no app do
              banco.
            </>
          ) : (
            `Tudo certo. Seus gastos e saldo do ${bank.name} chegam sozinhos, várias vezes ao dia. Não precisa fazer nada.`
          )}
        </Text>
      </View>
      <View className="gap-1.5">
        <Text size={12} tone="subtle">
          O que o Guará vê
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {bank.scopes.map((scope) => (
            <View key={scope} className="h-6 justify-center rounded-full bg-surface-muted px-2.5">
              <Text size={12} weight="bold" tone="muted" numberOfLines={1}>
                {scope}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1 gap-0.5">
          <Text size={13} tone="subtle">
            Última atualização
          </Text>
          <Text size={13} weight="semibold">
            {bank.updatedAt}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text size={13} tone="subtle">
            Autorização até
          </Text>
          <Text size={13} weight="semibold" tone={expiring ? 'warning' : 'default'}>
            {bank.authorizedUntil}
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {expiring ? (
          <Button size="sm" leftIcon="relink" className="h-10 px-3.5" onPress={onRenew}>
            Renovar autorização
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            leftIcon="refresh"
            className="h-10 px-3.5"
            onPress={onRefresh}
          >
            Atualizar agora
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          leftIcon="eye"
          className="h-10 px-3.5"
          onPress={onShowScopes}
        >
          Ver o que é compartilhado
        </Button>
        <Button variant="ghost" size="sm" className="h-10 px-3.5" onPress={onDisconnect}>
          <Text size={13} weight="bold" tone="negative">
            Desconectar
          </Text>
        </Button>
      </View>
    </View>
  );
}
