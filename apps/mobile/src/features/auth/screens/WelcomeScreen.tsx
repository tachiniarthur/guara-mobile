import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { StepIntro } from '@/components/layout';
import { Button, InfoNote, Input, Span, Text } from '@/components/ui';
import { OnboardingFrame } from '@/features/onboarding';
import { useOnline } from '@/hooks/useOnline';
import { isEmailAuthError, requestEmailCode } from '@/lib/auth-email';

import { NoInternetNote, OrDivider, SocialButtons } from '../components';
import { useSocialSignIn } from '../hooks/useSocialSignIn';
import { isValidEmail } from '../lib/code';
import { useEmailCodeStore } from '../store';

export const RATE_LIMITED = 'Você pediu muitos códigos. Espere um minuto e tente de novo.';

/** Boas-vindas e criação de conta (Google, Apple ou código no e-mail). */
export function WelcomeScreen() {
  const router = useRouter();
  const online = useOnline();
  const social = useSocialSignIn('onboarding');
  const { email: savedEmail, codeSent } = useEmailCodeStore();
  const [email, setEmail] = useState(savedEmail);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [sending, setSending] = useState(false);

  const createAccount = async () => {
    const address = email.trim().toLowerCase();
    if (!isValidEmail(address)) {
      setError('Confira o e-mail: falta algo no endereço.');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await requestEmailCode(address, { createUser: true });
      codeSent(address, 'sign-up');
      router.navigate('/verify-code');
    } catch (failure) {
      const code = isEmailAuthError(failure) ? failure.code : 'unavailable';
      if (code === 'network') setOffline(true);
      else if (code === 'rate-limited') setError(RATE_LIMITED);
      else toast.error('Não deu para enviar o código agora. Tente de novo em instantes.');
    } finally {
      setSending(false);
    }
  };

  return (
    <OnboardingFrame mataHeaderOnPhone>
      <StepIntro
        phoneSize={28}
        title="Bem-vindo ao Guará"
        description="Gastos, investimentos e alertas em um só lugar, com seis assistentes acompanhando tudo para você."
      />
      {!online || offline ? <NoInternetNote /> : null}
      <SocialButtons onGoogle={social.google} onApple={social.apple} busy={social.busy} />
      <OrDivider />
      <View className="gap-3.5">
        <Input
          label="E-mail"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError(null);
          }}
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          errorMessage={error ?? undefined}
          returnKeyType="send"
          onSubmitEditing={() => void createAccount()}
        />
        <Button fullWidth loading={sending} onPress={() => void createAccount()}>
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
          onPress={() => router.navigate('/sign-in')}
        >
          Entrar
        </Span>
      </Text>
      <Text variant="caption" tone="subtle" align="center">
        Ao continuar, você aceita os{' '}
        <Span
          tone="muted"
          underline
          accessibilityRole="link"
          onPress={() => router.navigate('/terms')}
        >
          Termos de uso
        </Span>{' '}
        e a{' '}
        <Span
          tone="muted"
          underline
          accessibilityRole="link"
          onPress={() => router.navigate('/privacy')}
        >
          Política de privacidade
        </Span>
        .
      </Text>
    </OnboardingFrame>
  );
}
