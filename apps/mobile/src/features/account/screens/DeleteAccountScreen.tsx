import { colors } from '@guara/ui-tokens';
import { joinList } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import {
  PageHeader,
  ResponsiveGrid,
  Screen,
  SectionCard,
  StickyFooter,
  TopBar,
} from '@/components/layout';
import { Button, Checkbox, Icon, Input, Text, type IconName } from '@/components/ui';
import { useBankConnectionsStore } from '@/features/bank-connections';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { ChatFab } from '@/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { usePlan, useUserStore } from '@/stores';

/** Word the user types to confirm. */
const CONFIRM_WORD = 'EXCLUIR';

function ErasedRow({
  icon,
  label,
  detail,
  last,
}: {
  icon: IconName;
  label: string;
  detail: string;
  last: boolean;
}) {
  return (
    <View className={cn('flex-row items-center gap-3 py-3', !last && 'border-b border-border')}>
      <View className="h-9 w-9 items-center justify-center rounded-12 bg-negative-muted">
        <Icon name={icon} size={20} color={colors.negative.DEFAULT} />
      </View>
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.35}>
          {label}
        </Text>
        <Text size={12} tone="subtle" leading={1.35}>
          {detail}
        </Text>
      </View>
    </View>
  );
}

/** Excluir conta (LGPD): what is erased, a copy of the data and the typed confirmation. */
export function DeleteAccountScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { setStatus } = useAuth();
  const email = useUserStore((state) => state.email);
  const banks = useBankConnectionsStore((state) => state.connections);
  const plan = usePlan();
  const [typed, setTyped] = useState('');
  const [understood, setUnderstood] = useState(false);
  const ready = typed.trim().toUpperCase() === CONFIRM_WORD && understood;

  const cancel = () => (router.canGoBack() ? router.back() : router.replace('/account'));
  const remove = () => {
    // TODO: `me.delete`, then sign out of Supabase.
    toast.success('Conta excluída. Seus dados são apagados em até 30 dias.');
    setStatus('signedOut');
  };

  const erased: { icon: IconName; label: string; detail: string }[] = [
    {
      icon: 'user',
      label: 'Seu perfil e preferências',
      detail: 'Nome, e-mail, perfil de investidor e avisos',
    },
    {
      icon: 'wallet',
      label: 'Seus dados financeiros',
      detail: 'Lançamentos, carteira, bens, tetos, metas e simulações',
    },
    {
      icon: 'message',
      label: 'Conversas com os assistentes',
      detail: 'Inclusive arquivos enviados no chat',
    },
    ...(banks.length
      ? [
          {
            icon: 'bank' as const,
            label: `${banks.length === 1 ? 'Autorização' : 'Autorizações'} ${joinList(banks.map((bank) => `do ${bank.name}`))}`,
            detail: 'Revogadas no Open Finance, também nos bancos',
          },
        ]
      : []),
    ...(plan.monthly !== null
      ? [
          {
            icon: 'tag' as const,
            label: `Assinatura do plano ${plan.name}`,
            detail: 'Cancelada; não há nova cobrança',
          },
        ]
      : []),
  ];

  const erasedCard = (
    <SectionCard
      title="O que será apagado"
      description="Em até 30 dias, salvo o que a lei obriga a guardar"
      titleSize={19}
      padding={22}
    >
      <View>
        {erased.map((item, index) => (
          <ErasedRow key={item.label} {...item} last={index === erased.length - 1} />
        ))}
      </View>
    </SectionCard>
  );
  const copyCard = (
    <SectionCard title="Antes de sair" titleSize={19} padding={22}>
      <Text size={14} tone="muted" leading={1.55}>
        {`Baixe uma cópia dos seus dados. O arquivo chega no e-mail ${email}.`}
      </Text>
      <Button
        variant="secondary"
        leftIcon="download"
        fullWidth
        onPress={() => toast.success(`Vamos enviar seus dados para ${email}`)}
      >
        Baixar meus dados (LGPD)
      </Button>
    </SectionCard>
  );
  const confirmCard = (
    <SectionCard title="Confirmar" titleSize={19} padding={22}>
      <Input
        label={`Digite ${CONFIRM_WORD} para confirmar`}
        placeholder={CONFIRM_WORD}
        value={typed}
        onChangeText={setTyped}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <Checkbox
        checked={understood}
        onChange={setUnderstood}
        label="Entendi que não dá para desfazer"
        labelWeight="bold"
        tone="brand"
      />
    </SectionCard>
  );
  const deleteButton = (
    <Button
      variant="destructive"
      size={isTablet ? 'md' : 'lg'}
      leftIcon="trash"
      disabled={!ready}
      className={isTablet ? 'px-4.5' : 'flex-1'}
      onPress={remove}
    >
      Excluir conta
    </Button>
  );

  if (isTablet) {
    return (
      <View className="flex-1">
        <Screen contentClassName="pb-28">
          <PageHeader
            title="Excluir conta"
            subtitle="Seus dados são apagados e as conexões com os bancos são revogadas"
            breadcrumb={{
              parents: [{ label: 'Meu perfil', href: '/account' }],
              current: 'Excluir conta',
            }}
          />
          {erasedCard}
          <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch>
            {copyCard}
            {confirmCard}
          </ResponsiveGrid>
          <View className="flex-row justify-end gap-2.5">
            <Button variant="ghost" size="md" className="px-4.5" onPress={cancel}>
              Cancelar
            </Button>
            {deleteButton}
          </View>
        </Screen>
        <ChatFab />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Screen
        header={<TopBar title="Excluir conta" leading="back" onLeadingPress={cancel} />}
        footer={
          <StickyFooter>
            <Button variant="ghost" size="lg" onPress={cancel}>
              Cancelar
            </Button>
            {deleteButton}
          </StickyFooter>
        }
        contentClassName="gap-4 pb-20 pt-2"
      >
        {erasedCard}
        {copyCard}
        {confirmCard}
      </Screen>
      <ChatFab />
    </View>
  );
}
