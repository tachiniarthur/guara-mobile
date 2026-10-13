import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { SectionCard, StepIntro } from '@/components/layout';
import { Button, Input, Span, Text } from '@/components/ui';
import { OnboardingFrame } from '@/features/onboarding';
import { useOnline } from '@/hooks/useOnline';
import { isEmailAuthError, requestEmailCode } from '@/lib/auth-email';

import { BackLink, NoInternetNote, OrDivider, SocialButtons } from '../components';
import { useSocialSignIn } from '../hooks/useSocialSignIn';
import { isValidEmail } from '../lib/code';
import { useEmailCodeStore, type CodeMode } from '../store';

import { RATE_LIMITED } from './WelcomeScreen';

/** "Entrar no Guará": Google, Apple or a 6-digit code by e-mail, with no password. */
export function SignInScreen() {
  const router = useRouter();
  const online = useOnline();
  const social = useSocialSignIn('signedIn');
  const { email: savedEmail, codeSent } = useEmailCodeStore();
  const [email, setEmail] = useState(savedEmail);
  const [error, setError] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [sending, setSending] = useState<CodeMode | null>(null);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/welcome'));

  const send = async (mode: CodeMode) => {
    const address = email.trim().toLowerCase();
    if (!isValidEmail(address)) {
      setError('Confira o e-mail: falta algo no endereço.');
      return;
    }
    setError(null);
    setSending(mode);
    try {
      await requestEmailCode(address, { createUser: mode === 'sign-up' });
      setOffline(false);
      setNoAccount(null);
      codeSent(address, mode);
      router.navigate('/verify-code');
    } catch (failure) {
      const code = isEmailAuthError(failure) ? failure.code : 'unavailable';
      if (code === 'no-account') setNoAccount(address);
      else if (code === 'network') setOffline(true);
      else if (code === 'rate-limited') setError(RATE_LIMITED);
      else toast.error('Não deu para enviar o código agora. Tente de novo em instantes.');
    } finally {
      setSending(null);
    }
  };

  return (
    <OnboardingFrame mataHeaderOnPhone>
      <BackLink onPress={goBack} />
      <StepIntro
        phoneSize={26}
        title="Entrar no Guará"
        description="Use a mesma forma de entrada de quando criou a conta."
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
            setNoAccount(null);
          }}
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          errorMessage={
            noAccount
              ? `Não achamos uma conta com ${noAccount}. Confira se o e-mail está certo.`
              : (error ?? undefined)
          }
          returnKeyType="send"
          onSubmitEditing={() => void send('sign-in')}
        />
        {noAccount ? (
          <SectionCard padding={16} gap={10}>
            <Text size={15} weight="bold">
              Quer criar uma conta com este e-mail?
            </Text>
            <Text size={14} tone="muted" leading={1.55}>
              Leva menos de um minuto. Depois você conecta seus bancos pela Malvo, se quiser.
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              <Button
                size="md"
                className="h-11 px-4.5"
                loading={sending === 'sign-up'}
                onPress={() => void send('sign-up')}
              >
                Criar conta com este e-mail
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="h-11 px-4.5"
                onPress={() => {
                  setEmail('');
                  setNoAccount(null);
                }}
              >
                Usar outro e-mail
              </Button>
            </View>
          </SectionCard>
        ) : (
          <>
            <Button fullWidth loading={sending === 'sign-in'} onPress={() => void send('sign-in')}>
              Receber código
            </Button>
            <Text size={13} tone="subtle" leading={1.55}>
              Enviamos um código de 6 dígitos para o seu e-mail. Não tem senha para lembrar.
            </Text>
          </>
        )}
      </View>
      <Text size={14} tone="muted" align="center">
        Ainda não tem conta?{' '}
        <Span
          weight="bold"
          tone="default"
          underline
          accessibilityRole="link"
          onPress={() => router.navigate('/welcome')}
        >
          Criar conta
        </Span>
      </Text>
    </OnboardingFrame>
  );
}
