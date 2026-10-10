import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button, Icon, Span, Text } from '@/components/ui';

import { useQuestionLimit } from '../hooks/useQuestionLimit';

/** In place of the composer when the plan's questions of the month ran out. */
export function ChatLimitNotice({ onDismiss }: { onDismiss: () => void }) {
  const router = useRouter();
  const { limit, planName, resetDay } = useQuestionLimit();
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="gap-2.5 rounded-20 border border-warning-border bg-brand-muted p-4"
    >
      <View className="flex-row items-start gap-2.5">
        <View style={{ marginTop: 2 }}>
          <Icon name="alertTriangle" size={18} color={colors.brand.DEFAULT} />
        </View>
        <Text size={14} leading={1.5} className="flex-1">
          <Span weight="bold">
            {`Você usou as ${limit} perguntas deste mês do plano ${planName}.`}
          </Span>
          {` Elas voltam no dia ${resetDay}. Até lá, seus dados continuam atualizando e os avisos chegam normalmente.`}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Button size="md" className="h-10 px-4.5" onPress={() => router.navigate('/account/plan')}>
          Ver planos
        </Button>
        <Button variant="ghost" size="md" className="h-10 px-4.5" onPress={onDismiss}>
          Entendi
        </Button>
      </View>
    </View>
  );
}
