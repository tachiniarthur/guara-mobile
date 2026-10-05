import { formatDate } from '@guara/utils';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { toast } from '@/components/feedback';
import { PageHeader, Screen, StickyFooter, TopBar } from '@/components/layout';
import { Badge, Button, InfoNote, Span, Text } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { ProfileQuestionView, ProfileResult } from '../components';
import { PROFILE_LABELS, type ProfileAnswers } from '../data';
import { useQuestionnaire } from '../hooks/useQuestionnaire';
import { useInvestorProfileStore } from '../store';

/** "Refazer perfil": the six questions again from Meu perfil, saved only at the end. */
export function RedoProfileScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { profile, save } = useInvestorProfileStore();
  const flow = useQuestionnaire(profile.answers);
  const current = PROFILE_LABELS[profile.type];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/account'));
  const back = () => {
    if (!flow.back()) close();
  };

  const finish = () => {
    save(flow.type, flow.answers as Required<ProfileAnswers>);
    toast.success(
      flow.type === profile.type
        ? `Perfil ${PROFILE_LABELS[flow.type]} confirmado`
        : `Seu perfil agora é ${PROFILE_LABELS[flow.type]}`,
    );
    close();
  };

  const change =
    flow.type === profile.type
      ? 'Seu perfil continua o mesmo; ao salvar, a data é atualizada.'
      : 'Ao salvar, as sugestões de Investimentos passam a seguir o novo perfil.';

  const body = flow.isResult ? (
    <ProfileResult
      type={flow.type}
      answers={flow.answers}
      note={
        <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
          <Text size={13} leading={1.5}>
            {'Antes: '}
            <Span weight="bold">{current}</Span>
            {`, respondido em ${formatDate(profile.answeredOn)}. Agora: `}
            <Span weight="bold">{PROFILE_LABELS[flow.type]}</Span>
            {`. ${change}`}
          </Text>
        </InfoNote>
      }
    />
  ) : (
    <>
      <View className="flex-row">
        <Badge label={`Seu perfil atual: ${current}`} tone="brand" />
      </View>
      <ProfileQuestionView
        question={flow.question!}
        index={flow.step + 1}
        total={flow.total}
        hint={flow.step === 0 ? 'Mesmas 6 perguntas do início · leva 2 minutos' : undefined}
        answer={flow.answer}
        onChange={flow.select}
      />
      <Text size={13} leading={1.55} tone="subtle">
        {`Enquanto você não salvar, o perfil ${current} continua valendo.`}
      </Text>
    </>
  );

  const actions = flow.isResult ? (
    <>
      <Button variant="secondary" onPress={flow.restart}>
        Refazer
      </Button>
      {isTablet ? <View className="flex-1" /> : null}
      <Button variant="inverse" className={isTablet ? undefined : 'flex-1'} onPress={finish}>
        Salvar perfil
      </Button>
    </>
  ) : (
    <>
      {isTablet && flow.step > 0 ? (
        <Button variant="secondary" onPress={back}>
          Voltar
        </Button>
      ) : null}
      {isTablet ? <View className="flex-1" /> : null}
      <Button
        variant="inverse"
        fullWidth={!isTablet}
        className={isTablet ? undefined : 'flex-1'}
        disabled={!flow.answer}
        onPress={flow.next}
      >
        Continuar
      </Button>
    </>
  );

  if (isTablet) {
    return (
      <Screen contentClassName="pb-16">
        <PageHeader
          title="Refazer perfil"
          breadcrumb={{
            parents: [{ label: 'Meu perfil', href: '/account' }],
            current: 'Perfil de investidor',
          }}
        />
        <View className="w-full max-w-[640px] gap-6 rounded-24 border border-border bg-surface p-8">
          {body}
          <View className="flex-row items-center gap-2.5 pt-2">{actions}</View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      header={
        <TopBar
          title="Refazer perfil"
          leading={flow.step === 0 ? 'close' : 'back'}
          onLeadingPress={back}
        />
      }
      footer={<StickyFooter>{actions}</StickyFooter>}
      contentClassName="gap-5 pt-2"
    >
      {body}
    </Screen>
  );
}
