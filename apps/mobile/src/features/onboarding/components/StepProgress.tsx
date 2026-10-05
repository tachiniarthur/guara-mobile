import { View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

const STEPS = ['1. Bancos', '2. Perfil', '3. Assistentes'] as const;
const STEP_NAMES = ['Bancos', 'Perfil', 'Assistentes'] as const;

export interface StepProgressProps {
  /** Current step, 1 to 3. */
  step: 1 | 2 | 3;
}

/** "Etapa 2 de 3" with three bars; done and current steps in Areia. */
export function StepProgress({ step }: StepProgressProps) {
  return (
    <View
      accessible
      accessibilityLabel={`Etapa ${step} de ${STEPS.length}: ${STEP_NAMES[step - 1]}`}
      className="gap-2.5"
    >
      <Text variant="caption" tone="muted">
        Etapa {step} de {STEPS.length}
      </Text>
      <View className="flex-row gap-2">
        {STEPS.map((label, index) => {
          const reached = index < step;
          const current = index === step - 1;
          return (
            <View key={label} className="flex-1 gap-1.5">
              <View className={cn('h-1 rounded-2', reached ? 'bg-foreground' : 'bg-border')} />
              <Text
                variant="micro"
                weight={current ? 'bold' : 'medium'}
                tone={reached ? 'default' : 'subtle'}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
