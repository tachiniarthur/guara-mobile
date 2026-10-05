import { useState } from 'react';

import { toast } from '@/components/feedback';
import { ResponsiveGrid } from '@/components/layout';
import { SearchInput, Span, Text } from '@/components/ui';

import { ONBOARDING_BANKS, PLAN_BANK_LIMIT } from '../data';

import { AccessList } from './AccessList';
import { BankOption } from './BankOption';

export interface BankPickerProps {
  connected: string[];
  onChange: (connected: string[]) => void;
  /** Banks that are already connected and can only be removed in Meu perfil. */
  locked?: readonly string[];
  /** Text after "1 de 3" ("bancos do plano …"). */
  planLabel: string;
}

/** Search, bank grid (connect up to the plan limit), plan usage and what the Guará reads. */
export function BankPicker({ connected, onChange, locked = [], planLabel }: BankPickerProps) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase('pt-BR');
  const banks = ONBOARDING_BANKS.filter((bank) =>
    bank.name.toLocaleLowerCase('pt-BR').includes(normalized),
  );

  const toggle = (id: string, name: string) => {
    if (locked.includes(id)) {
      toast.info(`${name} já está conectado. Para desconectar, use Meu perfil.`);
      return;
    }
    if (connected.includes(id)) {
      onChange(connected.filter((item) => item !== id));
      return;
    }
    if (connected.length >= PLAN_BANK_LIMIT) {
      toast.info(`Seu plano permite ${PLAN_BANK_LIMIT} bancos.`);
      return;
    }
    onChange([...connected, id]);
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
            onPress={() => toggle(bank.id, bank.name)}
          />
        ))}
      </ResponsiveGrid>
      <Text size={14} tone="muted">
        <Span weight="bold" tone="default">
          {connected.length} de {PLAN_BANK_LIMIT}
        </Span>{' '}
        {planLabel}
      </Text>
      <AccessList />
    </>
  );
}
