import type { InvestorProfileOption } from '@guara/types';
import { View } from 'react-native';

import { Disclosure, RadioGroup, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import type { ProfileQuestion } from '../data';

export interface ProfileQuestionViewProps {
  question: ProfileQuestion;
  /** 1-based position ("Pergunta 3 de 6"). */
  index: number;
  total: number;
  /** Line under the counter ("Mesmas 6 perguntas do início · leva 2 minutos"). */
  hint?: string;
  answer: InvestorProfileOption | null;
  onChange: (answer: InvestorProfileOption) => void;
}

/** One question of the investor profile and why it is asked. */
export function ProfileQuestionView({
  question,
  index,
  total,
  hint,
  answer,
  onChange,
}: ProfileQuestionViewProps) {
  const { isTablet } = useBreakpoint();
  return (
    <>
      <View className="gap-2.5">
        <View className="mb-4 gap-2">
          <Text variant="caption" tone="subtle">
            Pergunta {index} de {total}
          </Text>
          {hint ? (
            <Text variant="caption" tone="subtle">
              {hint}
            </Text>
          ) : null}
          <Text
            serif
            weight={isTablet ? 'extrabold' : 'bold'}
            size={isTablet ? 28 : 24}
            leading={1.3}
            tracking={-0.01}
            accessibilityRole="header"
          >
            {question.title}
          </Text>
        </View>
        <RadioGroup
          options={question.options.map((option) => ({ value: option.id, label: option.label }))}
          value={answer}
          onChange={onChange}
          accessibilityLabel={question.title}
        />
      </View>
      <Disclosure title="Por que perguntamos isso?" defaultOpen>
        <Text size={14} leading={1.6} tone="muted">
          {question.why}
        </Text>
      </Disclosure>
    </>
  );
}
