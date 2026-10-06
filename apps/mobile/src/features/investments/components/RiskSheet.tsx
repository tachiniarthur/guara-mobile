import { useState } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { Button, DataRow, Disclosure, LinkButton, RadioGroup, Sheet, Text } from '@/components/ui';

import { POSITIONS, RISK_REASONS, type Position, type RiskLevel } from '../data';

const RISK_TEXT: Record<RiskLevel, string> = {
  Baixo: 'Oscila pouco e tem garantia ou baixo risco de crédito',
  Médio: 'Oscila de vez em quando',
  Alto: 'Oscila bastante',
};

export interface RiskSheetProps {
  /** Position being adjusted (with the risk in use); null keeps the sheet closed. */
  target: Position | null;
  onClose: () => void;
  onChange: (positionId: string, risk: RiskLevel) => void;
  /** "Voltar para o automático": drops the user's choice. */
  onReset: (positionId: string) => void;
}

function RiskForm({
  target,
  onClose,
  onChange,
  onReset,
}: Omit<RiskSheetProps, 'target'> & { target: Position }) {
  const calculated = POSITIONS.find((item) => item.id === target.id)?.risk ?? target.risk;
  const [risk, setRisk] = useState<RiskLevel>(target.risk);
  const reasons = RISK_REASONS[target.id];
  const overridden = target.risk !== calculated;
  return (
    <>
      <Text size={14} leading={1.55} tone="muted">
        {`${target.name} · o risco ajuda a montar a alocação e os alertas. Mudar aqui vale só para a sua carteira.`}
      </Text>
      <RadioGroup
        accessibilityLabel={`Risco de ${target.name}`}
        value={risk}
        onChange={setRisk}
        options={(['Baixo', 'Médio', 'Alto'] as const).map((level) => ({
          value: level,
          label: level,
          description:
            level === calculated
              ? `${RISK_TEXT[level]} · calculado para este ativo`
              : RISK_TEXT[level],
        }))}
      />
      {reasons ? (
        <Disclosure title={`Por que “${calculated}”?`}>
          <View>
            {reasons.map((row) => (
              <DataRow key={row.label} label={row.label} value={row.value} />
            ))}
          </View>
        </Disclosure>
      ) : null}
      {overridden ? (
        <LinkButton
          label="Voltar para o automático"
          chevron={false}
          className="self-start"
          onPress={() => {
            onReset(target.id);
            toast.success(
              `Risco de ${target.name} voltou para o automático (${calculated.toLowerCase()})`,
            );
            onClose();
          }}
        />
      ) : null}
      <Button
        fullWidth
        size="lg"
        onPress={() => {
          if (risk !== target.risk) {
            if (risk === calculated) onReset(target.id);
            else onChange(target.id, risk);
            toast.success(`Risco de ${target.name} ajustado para ${risk.toLowerCase()}`);
          }
          onClose();
        }}
      >
        Salvar risco
      </Button>
    </>
  );
}

/** "Ajustar risco": the user overrides the risk computed from the asset's registration. */
export function RiskSheet({ target, onClose, onChange, onReset }: RiskSheetProps) {
  return (
    <Sheet open={target !== null} onClose={onClose} title="Ajustar risco">
      {target ? (
        <RiskForm
          key={`${target.id}-${target.risk}`}
          target={target}
          onClose={onClose}
          onChange={onChange}
          onReset={onReset}
        />
      ) : null}
    </Sheet>
  );
}
