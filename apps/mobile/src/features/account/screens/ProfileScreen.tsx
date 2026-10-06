import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { toast } from '@/components/feedback';
import { FormScreen, PageHeader, Screen, StickyFooter, TopBar } from '@/components/layout';
import {
  AVATAR_COLORS,
  Avatar,
  Button,
  DataRow,
  InfoNote,
  Input,
  LinkButton,
  Span,
  Text,
} from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';
import { pickSquarePhoto } from '@/lib/media';
import { useUserStore, type AvatarColor } from '@/stores';

const EmailSchema = z.email();
const RESEND_SECONDS = 60;

/** Seconds left before "Reenviar" (counts down once a second). */
function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return undefined;
    const timer = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  return { left, restart: () => setLeft(seconds) };
}

/** "Confirme seu novo e-mail": the link was sent; login stays on the current address. */
function ConfirmEmail({
  current,
  pending,
  name,
  onCancel,
  onDone,
}: {
  current: string;
  pending: string;
  name: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const { isTablet } = useBreakpoint();
  const { left, restart } = useCountdown(RESEND_SECONDS);
  const resend = (
    <Button
      variant="secondary"
      size={isTablet ? 'md' : 'lg'}
      leftIcon="retry"
      disabled={left > 0}
      className={isTablet ? 'px-4.5' : 'flex-1'}
      onPress={() => {
        restart();
        toast.success(`Enviamos outro link para ${pending}`);
      }}
    >
      {left > 0 ? `Reenviar (${left} s)` : 'Reenviar'}
    </Button>
  );
  const done = (
    <Button
      size={isTablet ? 'md' : 'lg'}
      className={isTablet ? 'px-4.5' : 'flex-1'}
      onPress={onDone}
    >
      Voltar ao perfil
    </Button>
  );
  const body = (
    <>
      <View className="gap-2">
        <Text serif weight="extrabold" size={24} leading={1.2} accessibilityRole="header">
          Confirme seu novo e-mail
        </Text>
        <Text size={15} leading={1.55} tone="muted">
          Enviamos um link para{' '}
          <Span weight="bold" tone="default">
            {pending}
          </Span>
          . Ele vale por 24 horas.
        </Text>
      </View>
      <View className="rounded-24 border border-border bg-surface px-[18px] py-2">
        <DataRow label="E-mail atual" value={current} />
        <DataRow label="Novo e-mail" value={`${pending} · aguardando`} />
        <DataRow label="Nome" value={`${name} · salvo`} />
      </View>
      <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
        {`Não chegou? Veja a caixa de spam ou reenvie em ${RESEND_SECONDS} segundos.`}
      </InfoNote>
      <LinkButton
        label="Cancelar troca de e-mail"
        chevron={false}
        className="self-start"
        onPress={onCancel}
      />
    </>
  );

  if (isTablet) {
    return (
      <Screen contentClassName="gap-5 pb-16">
        <PageHeader
          title="Editar perfil"
          breadcrumb={{
            parents: [{ label: 'Meu perfil', href: '/account' }],
            current: 'Editar perfil',
          }}
        />
        <View className="w-full max-w-[640px] gap-4 rounded-24 border border-border bg-surface p-6">
          {body}
          <View className="flex-row justify-end gap-2.5 pt-2">
            {resend}
            {done}
          </View>
        </View>
      </Screen>
    );
  }
  return (
    <Screen
      header={<TopBar title="Editar perfil" leading="close" onLeadingPress={onDone} />}
      footer={
        <StickyFooter>
          <View className="flex-row gap-2.5">
            {resend}
            {done}
          </View>
        </StickyFooter>
      }
      contentClassName="gap-4 pt-2"
    >
      {body}
    </Screen>
  );
}

function ColorSwatches({
  value,
  onChange,
}: {
  value: AvatarColor;
  onChange: (color: AvatarColor) => void;
}) {
  return (
    <View className="gap-2">
      <Text size={14} weight="bold">
        Cor das iniciais
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Cor das iniciais"
        className="flex-row gap-2.5"
      >
        {(Object.keys(AVATAR_COLORS) as AvatarColor[]).map((key) => {
          const selected = key === value;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityLabel={`Cor ${AVATAR_COLORS[key].label}`}
              accessibilityState={{ checked: selected }}
              hitSlop={4}
              onPress={() => {
                haptics.selection();
                onChange(key);
              }}
              className="h-9 w-9 rounded-full"
              style={{
                backgroundColor: AVATAR_COLORS[key].color,
                borderWidth: selected ? 3 : 1,
                borderColor: selected ? colors.foreground.DEFAULT : colors.border.strong,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

/** "Editar perfil": photo or initials (and their color), name and e-mail. */
export function ProfileScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const user = useUserStore();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.pendingEmail ?? user.email);
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(user.avatarColor);
  const [photoUri, setPhotoUri] = useState<string | null>(user.photoUri);
  const [confirming, setConfirming] = useState(user.pendingEmail !== null);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/account'));

  const trimmedEmail = email.trim().toLowerCase();
  const emailChanged = trimmedEmail !== user.email;
  const emailError =
    email.trim() && !EmailSchema.safeParse(trimmedEmail).success
      ? 'Confira o e-mail: falta algo como nome@exemplo.com'
      : undefined;
  const valid = name.trim().length > 0 && trimmedEmail.length > 0 && !emailError;

  if (confirming && user.pendingEmail) {
    return (
      <ConfirmEmail
        current={user.email}
        pending={user.pendingEmail}
        name={user.name}
        onCancel={() => {
          user.cancelEmailChange();
          setEmail(user.email);
          setConfirming(false);
          toast.info(`A troca foi cancelada. Seu e-mail continua ${user.email}.`);
        }}
        onDone={back}
      />
    );
  }

  const submit = () => {
    if (!valid) return;
    user.updateProfile({ name: name.trim(), avatarColor, photoUri });
    if (emailChanged) {
      user.requestEmailChange(trimmedEmail);
      setConfirming(true);
      return;
    }
    if (user.pendingEmail) user.cancelEmailChange();
    toast.success('Perfil atualizado');
    back();
  };

  const choosePhoto = async () => {
    const uri = await pickSquarePhoto();
    if (uri) setPhotoUri(uri);
  };

  const avatar = (
    <View className="flex-row items-center gap-4">
      <Avatar
        name={name.trim() || user.name}
        source={photoUri ? { uri: photoUri } : null}
        size={88}
        background={AVATAR_COLORS[avatarColor].color}
        decorative
      />
      <View className="min-w-0 flex-1 items-start gap-2">
        <Button
          variant="secondary"
          size="md"
          leftIcon="user"
          className="h-10 px-4.5"
          onPress={choosePhoto}
        >
          {photoUri ? 'Trocar foto' : 'Escolher foto'}
        </Button>
        {photoUri ? (
          <LinkButton label="Remover foto" chevron={false} onPress={() => setPhotoUri(null)} />
        ) : (
          <Text size={13} tone="subtle">
            Sem foto, mostramos suas iniciais
          </Text>
        )}
      </View>
    </View>
  );
  const fields: ReactNode = (
    <>
      {photoUri ? null : <ColorSwatches value={avatarColor} onChange={setAvatarColor} />}
      <Input
        label="Nome"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        helperText="Como os assistentes vão chamar você"
      />
      <Input
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        leftIcon="atSign"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        errorMessage={emailError}
      />
      <InfoNote icon="info" tone="info" size={13} className="rounded-14 px-3.5 py-3">
        <Text size={13} leading={1.5}>
          Se trocar o e-mail, enviamos um link de confirmação para o novo endereço. Até você
          confirmar, login e avisos continuam em <Span weight="bold">{user.email}</Span>.
        </Text>
      </InfoNote>
    </>
  );

  return (
    <FormScreen
      title="Editar perfil"
      parents={[{ label: 'Meu perfil', href: '/account' }]}
      current="Editar perfil"
      fallbackHref="/account"
      submit={{ label: 'Salvar', icon: 'check', onPress: submit, disabled: !valid }}
      contentClassName="gap-5 pt-2"
    >
      {isTablet ? (
        <View className="w-full max-w-[640px] gap-5 rounded-24 border border-border bg-surface p-6">
          {avatar}
          {fields}
        </View>
      ) : (
        <>
          {avatar}
          {fields}
        </>
      )}
    </FormScreen>
  );
}
