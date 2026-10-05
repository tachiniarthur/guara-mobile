import { toast } from '@/components/feedback';
import { OptionSheet } from '@/components/ui';

import type { RiskLevel } from '../data';

const RISK_OPTIONS: { value: RiskLevel; label: string; description: string }[] = [
  { value: 'Baixo', label: 'Baixo', description: 'Oscila pouco e tem crédito sólido' },
  { value: 'Médio', label: 'Médio', description: 'Oscila de vez em quando' },
  { value: 'Alto', label: 'Alto', description: 'Pode cair bastante em pouco tempo' },
];

export interface RiskTarget {
  id: string;
  name: string;
  risk: RiskLevel;
}

export interface RiskSheetProps {
  /** Position being adjusted; null keeps the sheet closed. */
  target: RiskTarget | null;
  onClose: () => void;
  onChange: (positionId: string, risk: RiskLevel) => void;
}

/** "Risco de PETR4": the user overrides the risk that came from the asset's registration. */
export function RiskSheet({ target, onClose, onChange }: RiskSheetProps) {
  return (
    <OptionSheet
      open={target !== null}
      onClose={onClose}
      title={target ? `Risco de ${target.name}` : 'Risco'}
      value={target?.risk ?? 'Médio'}
      options={RISK_OPTIONS}
      onChange={(risk) => {
        if (!target || risk === target.risk) return;
        onChange(target.id, risk);
        toast.success(`Risco de ${target.name} ajustado para ${risk.toLowerCase()}`);
      }}
    />
  );
}
