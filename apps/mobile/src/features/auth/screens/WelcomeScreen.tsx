import { useState } from 'react';
import { View } from 'react-native';

import { Button, Divider, InfoNote, Input, Span, Text } from '@/components/ui';
import { OnboardingFrame, StepIntro } from '@/features/onboarding';
import { useAuth } from '@/providers';

/** Boas-vindas e criação de conta (Google, Apple ou e-mail). */
export function WelcomeScreen() {
  const { setStatus } = useAuth();
  const [email, setEmail] = useState('');

  const startOnboarding = () => setStatus('onboarding');

  return (
    <OnboardingFrame jungleOnPhone>
      <StepIntro
        phoneSize={28}
        title="Bem-vindo ao Guará"
        description="Gastos, investimentos e alertas em um só lugar, com seis assistentes acompanhando tudo para você."
      />
      <View className="gap-2.5">
        <Button variant="secondary" fullWidth onPress={startOnboarding}>
          Continuar com Google
        </Button>
        <Button variant="secondary" fullWidth onPress={startOnboarding}>
          Continuar com Apple
        </Button>
      </View>
      <View className="flex-row items-center gap-3">
        <Divider className="flex-1" />
        <Text variant="caption" tone="subtle">
          ou com e-mail
        </Text>
        <Divider className="flex-1" />
      </View>
      <View className="gap-3.5">
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Button fullWidth onPress={startOnboarding}>
          Criar conta
        </Button>
      </View>
      <InfoNote icon="shield">
        Conexão pelo Open Finance Brasil. Nunca pedimos a senha do seu banco.
      </InfoNote>
      <Text size={15} align="center">
        Já tem conta?{' '}
        <Span
          weight="bold"
          underline
          accessibilityRole="link"
          onPress={() => setStatus('signedIn')}
        >
          Entrar
        </Span>
      </Text>
      <Text variant="caption" tone="subtle" align="center">
        Ao continuar, você aceita os{' '}
        <Span tone="muted" underline accessibilityRole="link">
          Termos de uso
        </Span>{' '}
        e a{' '}
        <Span tone="muted" underline accessibilityRole="link">
          Política de privacidade
        </Span>
        .
      </Text>
    </OnboardingFrame>
  );
}
