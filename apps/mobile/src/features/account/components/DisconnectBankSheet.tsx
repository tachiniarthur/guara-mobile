import { useState } from 'react';
import { View } from 'react-native';

import { Button, InfoNote, RadioGroup, Sheet, Text } from '@/components/ui';
import type { BankConnection } from '@/features/bank-connections';
import { usePlan } from '@/stores';

type HistoryChoice = 'keep' | 'delete';

export interface DisconnectBankSheetProps {
  /** Bank being disconnected (`null`: closed). */
  bank: BankConnection | null;
  /** Active connections of the plan (paused banks do not count). */
  activeCount: number;
  onClose: () => void;
  onConfirm: (bank: BankConnection, keepHistory: boolean) => void;
}

/** "Desconectar o Nubank?": revokes the consent and keeps or deletes the imported history. */
export function DisconnectBankSheet({
  bank,
  activeCount,
  onClose,
  onConfirm,
}: DisconnectBankSheetProps) {
  const plan = usePlan();
  const [history, setHistory] = useState<HistoryChoice>('keep');
  const close = () => {
    setHistory('keep');
    onClose();
  };
  // A paused bank does not use a connection of the plan.
  const frees = bank !== null && bank.status !== 'paused';

  return (
    <Sheet
      open={bank !== null}
      onClose={close}
      title={bank ? `Desconectar o ${bank.name}?` : undefined}
      width={520}
    >
      {bank ? (
        <>
          <Text size={15} tone="muted" leading={1.55}>
            {`O Guará para de receber saldo, gastos e investimentos do ${bank.name}, e a autorização no Open Finance é revogada também no banco.`}
          </Text>
          <RadioGroup
            accessibilityLabel="Histórico do banco"
            value={history}
            onChange={setHistory}
            className="gap-2"
            options={[
              {
                value: 'keep',
                label: 'Manter o histórico já importado',
                description: `Lançamentos e relatórios antigos do ${bank.name} continuam no Guará`,
              },
              {
                value: 'delete',
                label: `Apagar o histórico do ${bank.name}`,
                description: 'Some dos gastos, relatórios e metas. Não dá para desfazer',
              },
            ]}
          />
          {frees ? (
            <InfoNote icon="infoLarge" tone="neutral" size={13}>
              {`Libera 1 conexão do plano ${plan.name}: você fica com ${activeCount - 1} de ${plan.bankLimit}.`}
            </InfoNote>
          ) : null}
          <View className="flex-row justify-end gap-2.5">
            <Button variant="ghost" size="md" className="px-4.5" onPress={close}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="md"
              className="px-4.5"
              onPress={() => {
                onConfirm(bank, history === 'keep');
                setHistory('keep');
              }}
            >
              Desconectar
            </Button>
          </View>
        </>
      ) : null}
    </Sheet>
  );
}
