import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { ResponsiveGrid, SectionCard } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

/** Investimentos with an empty portfolio: connect, register by hand, profile and price alerts. */
export function NewUserInvestments() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();

  const intro = (
    <View className="rounded-24 border border-border bg-surface p-3">
      <EmptyState
        icon="trendingUp"
        title="Sua carteira começa aqui"
        description="Conecte banco ou corretora para trazer suas posições sozinhas, ou cadastre à mão o que não vem pelo Open Finance (ações, FIIs, cripto, imóveis e veículos)."
        actions={
          <>
            <Button size="md" onPress={() => router.navigate('/connect-bank')}>
              Conectar banco
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon="plus"
              onPress={() => router.navigate('/new-manual-asset')}
            >
              Cadastrar à mão
            </Button>
          </>
        }
      />
    </View>
  );
  const profile = (
    <SectionCard
      title="Perfil de investidor"
      description="Ainda não respondido"
      titleSize={17}
      padding={18}
    >
      <Text size={14} leading={1.55} tone="muted">
        Com o perfil, o Guará compara sua carteira com uma divisão-alvo e o Pacu sugere ajustes.
      </Text>
      <Button
        variant="secondary"
        size="md"
        className="self-start"
        onPress={() => router.navigate('/account/investor-profile')}
      >
        Responder agora · 2 minutos
      </Button>
    </SectionCard>
  );
  const alerts = (
    <SectionCard
      title="Alertas de preço"
      description="Funcionam mesmo sem carteira"
      titleSize={17}
      padding={18}
    >
      <Text size={14} leading={1.55} tone="muted">
        Escolha qualquer ação, FII ou cripto e o Caramelo avisa quando chegar no preço.
      </Text>
      <Button
        variant="secondary"
        size="md"
        leftIcon="plus"
        className="self-start"
        onPress={() => router.navigate('/new-price-alert')}
      >
        Criar alerta de preço
      </Button>
    </SectionCard>
  );

  return (
    <>
      {intro}
      {isTablet ? (
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16}>
          {profile}
          {alerts}
        </ResponsiveGrid>
      ) : (
        <>
          {profile}
          {alerts}
        </>
      )}
    </>
  );
}
