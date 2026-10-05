import { View } from 'react-native';

import { Disclosure, RadioGroup, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { RISK_QUESTION, type RiskAnswer } from '../data';

/** One question of the investor profile and why it is asked. */
export function RiskQuestion({
  answer,
  onChange,
}: {
  answer: RiskAnswer | null;
  onChange: (answer: RiskAnswer) => void;
}) {
  const { isTablet } = useBreakpoint();
  return (
    <>
      <View className="gap-2.5">
        <View className="mb-4 gap-2">
          <Text variant="caption" tone="subtle">
            Pergunta {RISK_QUESTION.index} de {RISK_QUESTION.total}
          </Text>
          <Text
            serif
            weight={isTablet ? 'extrabold' : 'bold'}
            size={isTablet ? 28 : 24}
            leading={1.3}
            tracking={-0.01}
            accessibilityRole="header"
          >
            {RISK_QUESTION.title}
          </Text>
        </View>
        <RadioGroup
          options={RISK_QUESTION.options}
          value={answer}
          onChange={onChange}
          accessibilityLabel={RISK_QUESTION.title}
        />
      </View>
      <Disclosure title="Por que perguntamos isso?" defaultOpen>
        <Text size={14} leading={1.6} tone="muted">
          Seu perfil ajuda a montar simulações que combinam com você. Ele vale só para Investimentos
          e pode ser refeito quando quiser em Meu perfil.
        </Text>
      </Disclosure>
    </>
  );
}
