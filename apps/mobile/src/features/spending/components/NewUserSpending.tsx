import { colors } from '@guara/ui-tokens';
import { EMPTY } from '@guara/utils';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { MataButton } from '@/components/illustrations';
import { ResponsiveGrid, SectionCard } from '@/components/layout';
import { Icon, Text, type IconName } from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

const EXAMPLES: { label: string; caption: string; icon: IconName }[] = [
  { label: 'Alimentação', caption: 'mercado, restaurantes e delivery', icon: 'tag' },
  { label: 'Transporte', caption: 'app, combustível e ônibus', icon: 'car' },
  { label: 'Assinaturas', caption: 'detectadas sozinhas', icon: 'repeat' },
];

/** Gastos of a user without a connected bank: what will show up, with no invented values. */
export function NewUserSpending() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();

  const intro = (
    <View className="rounded-24 border border-border bg-surface p-3">
      <EmptyState
        icon="wallet"
        title="Seus gastos aparecem aqui"
        description="Conecte um banco e o Guará organiza cada lançamento em categorias, mostra o ritmo do mês e avisa antes de passar do teto."
        actions={
          <MataButton
            label="Conectar banco"
            size={44}
            onPress={() => router.navigate('/connect-bank')}
          />
        }
      />
    </View>
  );
  const tamandua = (
    <AssistantNote assistant="tamandua">
      Assim que os dados chegarem, eu farejo para onde foi cada real e conto sem julgar.
    </AssistantNote>
  );
  const example = (
    <SectionCard title="Exemplo do que você vai ver" titleSize={17} padding={18}>
      <View>
        {EXAMPLES.map((item, index) => (
          <View
            key={item.label}
            accessible
            accessibilityLabel={`${item.label}, ${item.caption}: sem valor ainda`}
            className={cn(
              'flex-row items-center gap-3 py-3',
              index < EXAMPLES.length - 1 && 'border-b border-border',
            )}
          >
            <View className="h-9 w-9 items-center justify-center rounded-12 bg-surface-muted">
              <Icon name={item.icon} size={18} color={colors.foreground.muted} />
            </View>
            <View className="min-w-0 flex-1">
              <Text weight="medium" leading={1.35}>
                {item.label}
              </Text>
              <Text size={12} tone="subtle" leading={1.35}>
                {item.caption}
              </Text>
            </View>
            <Text weight="bold" tone="subtle">
              {EMPTY}
            </Text>
          </View>
        ))}
      </View>
      <Text size={13} tone="subtle">
        Valores aparecem depois da primeira sincronização.
      </Text>
    </SectionCard>
  );

  if (isTablet) {
    return (
      <>
        {intro}
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch={false}>
          {example}
          {tamandua}
        </ResponsiveGrid>
      </>
    );
  }
  return (
    <>
      {intro}
      {tamandua}
      {example}
    </>
  );
}
