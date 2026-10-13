import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { toast } from '@/components/feedback';
import { StepIntro } from '@/components/layout';
import { Button, Icon, Span, Text } from '@/components/ui';
import { OnboardingFrame } from '@/features/onboarding';
import { isEmailAuthError, requestEmailCode, verifyEmailCode } from '@/lib/auth-email';
import { haptics } from '@/lib/haptics';
import { useAuth } from '@/providers';

import { BackLink, CodeInput, NoInternetNote } from '../components';
import { CODE_LENGTH, RESEND_SECONDS, attemptsText, countdown, isExpired } from '../lib/code';
import { useEmailCodeStore } from '../store';

import { RATE_LIMITED } from './WelcomeScreen';

/** The current time (ms), updated every second while the screen is open. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/**
 * "Digite o código" (Entrar) / "Confirme seu e-mail" (Criar conta): the 6 digits sent to the
 * e-mail, with resend, wrong and expired code.
 */
export function VerifyCodeScreen() {
  const router = useRouter();
  const { setStatus } = useAuth();
  const { email, mode, sentAt, attemptsLeft, codeSent, failedAttempt, reset } = useEmailCodeStore();
  const now = useNow();
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);
  const [expired, setExpired] = useState(false);
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  // Opened without a code on its way (a link, an old screen): back to the start.
  useEffect(() => {
    if (sentAt === null) router.replace('/welcome');
  }, [sentAt, router]);
  if (sentAt === null) return null;

  const signUp = mode === 'sign-up';
  const wait = RESEND_SECONDS - (now - sentAt) / 1000;
  const outOfTries = attemptsLeft === 0;
  const needsNewCode = expired || outOfTries;
  const changeEmail = () => (router.canGoBack() ? router.back() : router.replace('/sign-in'));

  const verify = async (value = code) => {
    if (value.length < CODE_LENGTH || checking || needsNewCode) return;
    if (isExpired(sentAt, Date.now())) {
      setExpired(true);
      return;
    }
    setChecking(true);
    try {
      await verifyEmailCode(email, value);
      haptics.success();
      reset();
      setStatus(signUp ? 'onboarding' : 'signedIn');
    } catch (failure) {
      const reason = isEmailAuthError(failure) ? failure.code : 'unavailable';
      if (reason === 'invalid') {
        haptics.error();
        failedAttempt();
        setWrong(true);
      } else if (reason === 'network') {
        setOffline(true);
      } else {
        toast.error('Não deu para conferir o código agora. Tente de novo em instantes.');
      }
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await requestEmailCode(email, { createUser: signUp });
      codeSent(email, mode);
      setCode('');
      setWrong(false);
      setExpired(false);
      setOffline(false);
      toast.success('Enviamos um novo código.');
    } catch (failure) {
      const reason = isEmailAuthError(failure) ? failure.code : 'unavailable';
      if (reason === 'network') setOffline(true);
      else if (reason === 'rate-limited') toast.error(RATE_LIMITED);
      else toast.error('Não deu para enviar o código agora. Tente de novo em instantes.');
    } finally {
      setResending(false);
    }
  };

  return (
    <OnboardingFrame mataHeaderOnPhone>
      <BackLink onPress={changeEmail} />
      <StepIntro
        phoneSize={26}
        title={signUp ? 'Confirme seu e-mail' : 'Digite o código'}
        description={
          signUp
            ? 'Para criar sua conta, digite os 6 números que enviamos. O código vale por 10 minutos.'
            : 'Enviamos 6 números para o seu e-mail. O código vale por 10 minutos.'
        }
      />
      <View className="flex-row items-center gap-2.5 rounded-16 bg-surface-muted px-3.5 py-3">
        <Text size={14} tone="muted" className="min-w-0 flex-1">
          Enviado para{' '}
          <Span weight="bold" tone="default">
            {email}
          </Span>
        </Text>
        <Pressable accessibilityRole="link" onPress={changeEmail} hitSlop={8}>
          <Text size={14} weight="bold" underline>
            Trocar e-mail
          </Text>
        </Pressable>
      </View>
      {offline ? <NoInternetNote /> : null}
      <CodeInput
        value={code}
        onChange={(value) => {
          setCode(value);
          setWrong(false);
        }}
        invalid={wrong || needsNewCode}
        editable={!needsNewCode}
        onComplete={(value) => void verify(value)}
      />
      {needsNewCode ? (
        <View accessibilityRole="alert" className="gap-1">
          <View className="flex-row items-center gap-2">
            <Icon name="alertTriangle" size={16} color={colors.negative.DEFAULT} />
            <Text size={14} weight="bold" tone="negative">
              {expired ? 'Este código venceu.' : 'Você usou as 5 tentativas.'}
            </Text>
          </View>
          <Text size={14} tone="muted" leading={1.5}>
            {expired
              ? 'Os códigos valem por 10 minutos. Peça um novo; o anterior deixa de funcionar.'
              : 'Por segurança, peça um novo código; o anterior deixa de funcionar.'}
          </Text>
        </View>
      ) : wrong ? (
        <Text accessibilityRole="alert" size={14} tone="negative" leading={1.5}>
          {`Código incorreto. Confira os números e tente de novo. ${attemptsText(attemptsLeft)}`}
        </Text>
      ) : null}
      {needsNewCode ? (
        <Button fullWidth loading={resending} onPress={() => void resend()}>
          Enviar novo código
        </Button>
      ) : (
        <>
          <View className="flex-row flex-wrap items-center justify-between gap-2.5">
            {wait > 0 ? (
              <Text size={14} tone="muted">
                Reenviar código em{' '}
                <Span weight="bold" tone="default" tabular>
                  {countdown(wait)}
                </Span>
              </Text>
            ) : (
              <Text size={14} tone="muted">
                Não chegou? Confira a caixa de spam.
              </Text>
            )}
            <Button
              variant="outline"
              size="md"
              className="h-10 px-3.5"
              disabled={wait > 0}
              loading={resending}
              onPress={() => void resend()}
            >
              Reenviar
            </Button>
          </View>
          <Button
            fullWidth
            disabled={code.length < CODE_LENGTH || wrong}
            loading={checking}
            onPress={() => void verify()}
          >
            {signUp ? 'Criar conta' : 'Entrar'}
          </Button>
        </>
      )}
      <Text size={13} tone="subtle" leading={1.55}>
        O Guará só lê seus dados e nunca pede a senha do seu banco.
      </Text>
    </OnboardingFrame>
  );
}
