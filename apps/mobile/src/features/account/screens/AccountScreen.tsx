import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { toast } from '@/components/feedback';
import { MataSurface } from '@/components/illustrations';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import {
  Avatar,
  Button,
  Checkbox,
  ConfirmDialog,
  Icon,
  InfoNote,
  SegmentedControl,
  Sheet,
  Switch,
  Text,
} from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { useUiPreferences, type TextSize } from '@/stores/ui-preferences';

import { PLAN, useBankConnectionsStore, type BankConnection } from '@/features/bank-connections';

import { BankConnectionCard } from '../components';
import { CURRENT_USER, DEVICES, INVESTOR_PROFILE, NOTICE_KINDS } from '../data';

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'default', label: 'Padrão' },
  { value: 'large', label: 'Grande' },
  { value: 'larger', label: 'Maior' },
];

function SettingsCard({
  title,
  description,
  gap = 14,
  grow = false,
  children,
}: {
  title: string;
  description?: string;
  gap?: number;
  grow?: boolean;
  children: ReactNode;
}) {
  return (
    <SectionCard
      title={title}
      description={description}
      titleSize={18}
      gap={gap}
      className={grow ? 'flex-1' : undefined}
    >
      {children}
    </SectionCard>
  );
}

function TextLink({
  label,
  tone = 'default',
  onPress,
}: {
  label: string;
  tone?: 'default' | 'negative';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1 self-start',
        tone === 'negative' ? 'min-h-8' : 'min-h-6',
      )}
    >
      <Text size={14} weight="bold" tone={tone} underline={tone === 'default'}>
        {label}
      </Text>
      {tone === 'default' ? (
        <Icon name="chevronRight" size={16} color={colors.foreground.DEFAULT} />
      ) : null}
    </Pressable>
  );
}

type Dialog =
  { kind: 'disconnect'; bank: BankConnection } | { kind: 'signOutAll' } | { kind: 'delete' } | null;

/** Meu perfil e configurações: profile, investor profile, banks, notices, appearance and security. */
export function AccountScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const preferences = useUiPreferences();
  const banks = useBankConnectionsStore((state) => state.connections);
  const disconnect = useBankConnectionsStore((state) => state.disconnect);
  const [scopesOf, setScopesOf] = useState<BankConnection | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const free = CURRENT_USER.banksAllowed - banks.length;

  const hero = (
    <MataSurface veil={[0.85, 0.55, 0.1]} className="rounded-24 border border-border-strong p-5">
      <View className="flex-row items-center gap-3.5">
        <Avatar name={CURRENT_USER.name} size={56} tone="brand" decorative />
        <View className="min-w-0 flex-1">
          <Text size={18} weight="bold" leading={1.35}>
            {CURRENT_USER.name}
          </Text>
          <Text size={14} tone="muted" leading={1.35} numberOfLines={1}>
            {CURRENT_USER.email}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={() => router.navigate('/account/profile')}
          className="h-10 items-center justify-center rounded-full border px-4.5 active:opacity-80"
          style={{ backgroundColor: colors.veil, borderColor: colors.avatarRing }}
        >
          <Text size={14} weight="bold">
            Editar
          </Text>
        </Pressable>
      </View>
    </MataSurface>
  );

  const investorProfile = (
    <SettingsCard title="Perfil de investidor">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-12 bg-info-muted">
          <Icon name="shield" size={20} color={colors.info.DEFAULT} />
        </View>
        <View className="flex-1">
          <Text weight="bold" leading={1.35}>
            {INVESTOR_PROFILE.name}
          </Text>
          <Text size={13} tone="subtle" leading={1.35}>
            {INVESTOR_PROFILE.answered}
          </Text>
        </View>
      </View>
      <Button
        variant="secondary"
        size="md"
        className="px-4.5"
        onPress={() => router.navigate('/account/investor-profile')}
      >
        Refazer questionário
      </Button>
    </SettingsCard>
  );

  const appearance = (
    <SettingsCard title="Aparência e acessibilidade" grow>
      <View className="gap-2">
        <Text size={14} weight="bold">
          Tamanho do texto
        </Text>
        <SegmentedControl
          options={TEXT_SIZES}
          value={preferences.textSize}
          onChange={(textSize) => preferences.set({ textSize })}
          appearance="raised"
          fill
          accessibilityLabel="Tamanho do texto"
        />
      </View>
      <Switch
        label="Reduzir animações"
        value={preferences.reduceMotion}
        onValueChange={(reduceMotion) => preferences.set({ reduceMotion })}
      />
      <Switch
        label="Ocultar valores ao abrir o app"
        value={preferences.hideBalancesOnOpen}
        onValueChange={(hideBalancesOnOpen) => preferences.set({ hideBalancesOnOpen })}
      />
    </SettingsCard>
  );

  const notifications = (
    <SettingsCard title="Notificações" gap={10}>
      <View accessibilityLabel="Canais por tipo de aviso">
        <View className="flex-row">
          {['Aviso', 'Celular', 'E-mail'].map((header, index) => (
            <Text
              key={header}
              size={12}
              weight="bold"
              tracking={0.06}
              tone="subtle"
              align={index === 0 ? 'left' : 'center'}
              numberOfLines={1}
              adjustsFontSizeToFit
              style={index === 0 ? { flex: 1 } : { width: 64 }}
            >
              {header.toUpperCase()}
            </Text>
          ))}
        </View>
        {NOTICE_KINDS.map((kind) => (
          <View key={kind.key} className="min-h-13 flex-row items-center border-b border-border">
            <Text size={15} className="flex-1">
              {kind.label}
            </Text>
            {(['push', 'email'] as const).map((channel) => (
              <View key={channel} className="w-16 items-center">
                <Checkbox
                  checked={preferences.notices[kind.key][channel]}
                  onChange={() => preferences.toggleNotice(kind.key, channel)}
                  accessibilityLabel={`${kind.label} por ${channel === 'push' ? 'notificação no celular' : 'e-mail'}`}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </SettingsCard>
  );

  const security = (
    <SettingsCard title="Segurança e privacidade" gap={10} grow>
      <Switch
        label="Entrar com biometria"
        description="Face ID ou digital"
        value={preferences.biometrics}
        onValueChange={(biometrics) => preferences.set({ biometrics })}
      />
      <View className="gap-1.5">
        <Text size={12} weight="bold" tracking={0.06} tone="subtle">
          APARELHOS COM ACESSO
        </Text>
        <View>
          {DEVICES.map((device) => (
            <View
              key={device.id}
              className="flex-row items-center gap-3 border-b border-border py-2.5"
            >
              <View className="h-9 w-9 items-center justify-center rounded-10 bg-surface-muted">
                <Icon name={device.icon} size={18} color={colors.foreground.muted} />
              </View>
              <View className="min-w-0 flex-1">
                <Text weight="medium" leading={1.35}>
                  {device.name}
                </Text>
                <Text size={13} tone="subtle" leading={1.35}>
                  {device.detail}
                </Text>
              </View>
              <Text size={13} tone={device.current ? 'positive' : 'subtle'}>
                {device.lastSeen}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View className="gap-1">
        <TextLink
          label="Sair de todos os aparelhos"
          onPress={() => setDialog({ kind: 'signOutAll' })}
        />
        <TextLink
          label="Baixar meus dados (LGPD)"
          onPress={() => toast.success(`Vamos enviar seus dados para ${CURRENT_USER.email}`)}
        />
        <TextLink
          label="Excluir conta"
          tone="negative"
          onPress={() => setDialog({ kind: 'delete' })}
        />
      </View>
    </SettingsCard>
  );

  const bankCards = banks.map((bank) => (
    <BankConnectionCard
      key={bank.id}
      bank={bank}
      onRefresh={() => toast.success(`${bank.name} atualizado`)}
      onRenew={() =>
        router.navigate({
          pathname: '/malvo/[bankId]',
          params: { bankId: bank.id, mode: 'renew' },
        })
      }
      onShowScopes={() => setScopesOf(bank)}
      onDisconnect={() => setDialog({ kind: 'disconnect', bank })}
    />
  ));
  const addBank =
    free > 0 ? (
      <Pressable
        accessibilityRole="link"
        onPress={() => router.navigate('/connect-bank')}
        className="flex-row items-center gap-3.5 rounded-18 border-[1.5px] border-dashed border-border-strong p-4 active:bg-surface-pressed"
      >
        <View className="h-11 w-11 items-center justify-center rounded-12 bg-surface-muted">
          <Icon name="plus" size={20} color={colors.brand.DEFAULT} />
        </View>
        <View className="flex-1">
          <Text size={15} weight="bold" leading={1.35}>
            Conectar mais um banco
          </Text>
          <Text size={13} tone="subtle" leading={1.35}>
            Você ainda tem {free} {free === 1 ? 'conexão' : 'conexões'} no seu plano
          </Text>
        </View>
        <Icon name="chevronRight" size={18} color={colors.foreground.muted} />
      </Pressable>
    ) : null;

  const banksCard = (
    <SettingsCard
      title="Bancos conectados"
      description="Status, permissões e validade de cada conexão"
      gap={16}
    >
      <View className="gap-2">
        <View className="flex-row justify-between gap-3">
          <Text size={13} tone="muted" className="flex-1">
            <Text size={13} weight="bold">
              {banks.length} de {CURRENT_USER.banksAllowed}
            </Text>{' '}
            conexões usadas no plano {PLAN.name}
          </Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={10}
            onPress={() => router.navigate('/account/plan')}
          >
            <Text size={13} weight="bold" underline>
              Ver planos
            </Text>
          </Pressable>
        </View>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${banks.length} de ${CURRENT_USER.banksAllowed} conexões usadas`}
          className="h-2 flex-row gap-1"
        >
          {Array.from({ length: CURRENT_USER.banksAllowed }, (_, index) => (
            <View
              key={index}
              className={cn('flex-1 rounded-4', index < banks.length ? 'bg-positive' : 'bg-border')}
            />
          ))}
        </View>
      </View>
      {isTablet ? (
        <View className="gap-3">
          <ResponsiveGrid columns={{ tablet: 2 }} gap={12} stretch>
            {bankCards}
          </ResponsiveGrid>
          {addBank}
        </View>
      ) : (
        <View className="gap-3">
          {bankCards}
          {addBank}
        </View>
      )}
      <InfoNote icon="shield" tone="plain" size={13} iconColor={colors.positive.DEFAULT}>
        Conexão pelo Open Finance: o Guará só lê seus dados, nunca movimenta dinheiro. Você pode
        desconectar aqui ou no app do banco quando quiser.
      </InfoNote>
    </SettingsCard>
  );

  const confirm = () => {
    if (dialog?.kind === 'disconnect') {
      const { bank } = dialog;
      disconnect(bank.id);
      toast.success(`${bank.name} desconectado`);
    } else if (dialog?.kind === 'signOutAll') {
      toast.success('Os outros aparelhos foram desconectados');
    } else if (dialog?.kind === 'delete') {
      toast.info('Enviamos um e-mail para confirmar a exclusão');
    }
    setDialog(null);
  };

  return (
    <>
      <Screen
        header={isTablet ? null : <TopBar title="Meu perfil" leading="back" fallbackHref="/" />}
        contentClassName={isTablet ? 'gap-5 pb-28' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <>
            <PageHeader title="Meu perfil e configurações" />
            <View className="flex-row gap-4">
              <View className="min-w-0 flex-1 gap-4">
                {hero}
                {investorProfile}
                {appearance}
              </View>
              <View className="min-w-0 flex-1 gap-4">
                {notifications}
                {security}
              </View>
            </View>
            {banksCard}
          </>
        ) : (
          <>
            {hero}
            {investorProfile}
            {banksCard}
            {notifications}
            {appearance}
            {security}
          </>
        )}
      </Screen>
      <Sheet
        open={scopesOf !== null}
        onClose={() => setScopesOf(null)}
        title={scopesOf ? `O que o ${scopesOf.name} compartilha` : undefined}
      >
        <Text tone="muted">O Guará só lê estes dados, nunca movimenta dinheiro:</Text>
        {scopesOf?.scopes.map((scope) => (
          <View key={scope} className="flex-row items-center gap-2.5">
            <Icon name="checkThin" size={16} color={colors.positive.DEFAULT} />
            <Text>{scope}</Text>
          </View>
        ))}
        <Text size={13} tone="subtle">
          Autorização válida até {scopesOf?.authorizedUntil}.
        </Text>
      </Sheet>
      <ConfirmDialog
        open={dialog !== null}
        title={
          dialog?.kind === 'disconnect'
            ? `Desconectar o ${dialog.bank.name}?`
            : dialog?.kind === 'signOutAll'
              ? 'Sair de todos os aparelhos?'
              : 'Excluir sua conta?'
        }
        message={
          dialog?.kind === 'disconnect'
            ? 'Gastos e saldo deste banco param de atualizar. Você pode conectar de novo quando quiser.'
            : dialog?.kind === 'signOutAll'
              ? 'Você continua conectado só neste aparelho.'
              : 'Seus dados serão apagados e não dá para desfazer.'
        }
        confirmLabel={
          dialog?.kind === 'delete'
            ? 'Excluir conta'
            : dialog?.kind === 'disconnect'
              ? 'Desconectar'
              : 'Sair'
        }
        destructive
        onConfirm={confirm}
        onCancel={() => setDialog(null)}
      />
    </>
  );
}
