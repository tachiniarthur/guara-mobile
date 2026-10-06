import { useState } from 'react';

import { toast } from '@/components/feedback';
import { ResponsiveGrid } from '@/components/layout';
import { SearchInput, Span, Text } from '@/components/ui';

import { usePlan } from '@/stores';

import { SUPPORTED_BANKS, type BankOptionData } from '../data';

import { AccessList } from './AccessList';
import { BankOption } from './BankOption';

export interface BankPickerProps {
  /** Ids of the banks already connected. */
  connected: readonly string[];
  /** A bank that is not connected yet was chosen (opens the Malvo). */
  onConnect: (bank: BankOptionData) => void;
  /** Said when a connected bank is tapped ("Para desconectar, use Meu perfil."). */
  connectedHint?: string;
  /** Text after "2 de 3" ("bancos do plano Completo…"). */
  planLabel: string;
}

/** Search, bank grid (connect up to the plan limit), plan usage and what the Guará reads. */
export function BankPicker({ connected, onConnect, connectedHint, planLabel }: BankPickerProps) {
  const plan = usePlan();
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase('pt-BR');
  const banks = SUPPORTED_BANKS.filter((bank) =>
    bank.name.toLocaleLowerCase('pt-BR').includes(normalized),
  );

  const choose = (bank: BankOptionData) => {
    if (connected.includes(bank.id)) {
      toast.info(`${bank.name} já está conectado.${connectedHint ? ` ${connectedHint}` : ''}`);
      return;
    }
    if (connected.length >= plan.bankLimit) {
      toast.info(`Seu plano ${plan.name} permite ${plan.banksLabel}.`);
      return;
    }
    onConnect(bank);
  };

  return (
    <>
      <SearchInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar banco ou corretora"
        accessibilityLabel="Buscar banco"
      />
      <ResponsiveGrid columns={{ phone: 2, tablet: 2 }} gap={10} stretch={false}>
        {banks.map((bank) => (
          <BankOption
            key={bank.id}
            name={bank.name}
            mark={bank.mark}
            connected={connected.includes(bank.id)}
            onPress={() => choose(bank)}
          />
        ))}
      </ResponsiveGrid>
      <Text size={14} tone="muted">
        <Span weight="bold" tone="default">
          {connected.length} de {plan.bankLimit}
        </Span>{' '}
        {planLabel}
      </Text>
      <AccessList />
    </>
  );
}
