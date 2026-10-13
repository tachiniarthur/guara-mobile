import type { CategoryId } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatCents } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, Share, View } from 'react-native';

import {
  EmptyState,
  ScreenStates,
  lastUpdateLabel,
  toast,
  useScreenStatus,
} from '@/components/feedback';
import { FillColumn, PageHeader, Screen, SectionCard, TopBar } from '@/components/layout';
import {
  Badge,
  Button,
  Checkbox,
  Chip,
  ConfirmDialog,
  Icon,
  IconButton,
  InfoNote,
  Input,
  MoneyText,
  OptionSheet,
  Sheet,
  Text,
  type IconName,
} from '@/components/ui';
import { AssistantNote } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';
import { ChatFab } from '@/navigation';

import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  QUICK_CATEGORIES,
} from '../categories';
import { LEDGER, SPENDING } from '../data';
import { useLedger } from '../hooks/useLedger';
import { accountLabel, bankLabel, budgetNote, detailRows, unusualMessage } from '../lib/format';
import { displayName, merchantKey, signedAmount } from '../lib/ledger';
import { useSpendingStore } from '../store';

function ActionRow({
  icon,
  title,
  description,
  onPress,
  disabled = false,
  last = false,
}: {
  icon: IconName;
  title: string;
  description?: string;
  onPress: () => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'min-h-13 flex-row items-center gap-3.5 px-1.5 py-1 active:bg-surface-pressed',
        !last && 'border-b border-border',
        disabled && 'opacity-60',
      )}
    >
      <Icon name={icon} size={20} color={colors.foreground.muted} />
      <View className="flex-1">
        <Text size={16} weight="semibold" leading={1.35}>
          {title}
        </Text>
        {description ? (
          <Text size={13} tone="subtle" leading={1.35}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/** Detail of a transaction: fields, Quero-quero, category, cap and the extra actions. */
export function TransactionDetailScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const ledger = useLedger();
  const store = useSpendingStore();
  const [forMerchant, setForMerchant] = useState(true);
  const [otherOpen, setOtherOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  // Static data today: the API adds loading and error. "Empty": the bank dropped the purchase.
  const status = useScreenStatus('ready');
  const base = LEDGER.find((item) => item.id === transactionId);
  const tx = ledger.transactions.find((item) => item.id === transactionId);

  if (!base || !tx || status === 'empty') {
    return (
      <Screen header={<TopBar title="Lançamento" fallbackHref="/spending/transactions" />}>
        <EmptyState
          icon="search"
          title="Lançamento não encontrado"
          description="O banco pode ter cancelado esta compra ou juntado com outra. Os outros lançamentos continuam iguais."
          action={{
            label: 'Ver lançamentos',
            onPress: () => router.replace('/spending/transactions'),
          }}
        />
      </Screen>
    );
  }

  const name = displayName(tx);
  const account = ledger.accounts[tx.accountId];
  const unusual = ledger.unusualOf(tx.id);
  const pending = unusual?.status === 'pending';
  const current = tx.categoryId;
  const currentLabel = current ? CATEGORY_LABELS[current] : 'Sem categoria';
  const pool = tx.direction === 'in' ? INCOME_CATEGORIES : QUICK_CATEGORIES;
  const quick = [...(current ? [current] : []), ...pool.filter((id) => id !== current)].slice(0, 4);
  const sameStore = LEDGER.filter(
    (item) => item.id !== tx.id && merchantKey(item) === merchantKey(tx),
  ).length;
  const notSubscription = ledger.edits.notSubscription[merchantKey(tx)] === true;
  const note = budgetNote(tx, ledger.budgets);

  const choose = (categoryId: CategoryId) => {
    if (categoryId === current) return;
    store.recategorize(base, categoryId, forMerchant);
    haptics.selection();
    const others = forMerchant && sameStore > 0 ? ` e em mais ${sameStore} desta loja` : '';
    toast.success(`Categoria alterada para ${CATEGORY_LABELS[categoryId]}${others}`);
  };

  const toggleMerchant = (value: boolean) => {
    setForMerchant(value);
    // Applies the choice to what the user already changed on this transaction.
    if (ledger.edits.categories[tx.id] && current) store.recategorize(base, current, value);
  };

  const share = () => {
    const amount = formatCents(signedAmount(tx), { signDisplay: 'always', typographicMinus: true });
    const date = detailRows(tx, account)[0]?.value ?? '';
    void Share.share({ message: `${name} · ${amount} · ${date} · ${accountLabel(tx, account)}` });
  };

  const openNote = () => {
    setNoteDraft(tx.note ?? '');
    setNoteOpen(true);
  };
  const saveNote = () => {
    const text = noteDraft.trim();
    store.setNote(tx.id, text ? text.slice(0, 280) : null);
    setNoteOpen(false);
    toast.success(text ? 'Observação salva' : 'Observação removida');
  };

  const hero = (
    <View className="items-center gap-2 pb-1 pt-1.5">
      <View
        className={cn(
          'h-13 w-13 items-center justify-center rounded-12',
          pending ? 'bg-negative-muted' : 'bg-surface-muted',
        )}
      >
        <Icon
          name="tag"
          size={24}
          color={pending ? colors.negative.DEFAULT : colors.foreground.muted}
        />
      </View>
      {isTablet ? null : (
        <Text size={15} tone="muted" align="center">
          {name}
        </Text>
      )}
      <MoneyText
        value={signedAmount(tx)}
        showSign
        serif
        weight="extrabold"
        size={34}
        leading={1.1}
        tracking={-0.01}
        tone={tx.markedDuplicate ? 'subtle' : tx.direction === 'in' ? 'positive' : 'default'}
      />
      <View className="flex-row gap-1.5">
        {pending ? <Badge label="Fora do padrão" tone="negative" icon="alertTriangle" /> : null}
        {tx.markedDuplicate ? <Badge label="Duplicado" icon="copy" /> : null}
        {tx.hiddenFromReports ? <Badge label="Fora dos relatórios" icon="eye" /> : null}
      </View>
    </View>
  );

  const quero = unusual ? (
    <AssistantNote
      assistant="quero_quero"
      actions={
        pending ? (
          <>
            <Button
              size="md"
              leftIcon="check"
              className="h-10 px-4.5"
              onPress={() => {
                store.setUnusualStatus(tx.id, 'acknowledged');
                toast.success('Obrigado! O Quero-quero vai lembrar disso.');
              }}
            >
              Fui eu
            </Button>
            <Button
              variant="negativeOutline"
              size="md"
              className="h-10 px-4.5"
              onPress={() => setReportOpen(true)}
            >
              Não reconheço
            </Button>
          </>
        ) : undefined
      }
    >
      {unusual.status === 'pending'
        ? unusualMessage(tx, unusual.reasons)
        : unusual.status === 'acknowledged'
          ? 'Você confirmou esta compra. Vou levar isso em conta nas próximas parecidas.'
          : `Compra marcada como não reconhecida. Bloqueie o cartão e conteste a compra com o ${account ? bankLabel(account.bank) : 'banco'}.`}
    </AssistantNote>
  ) : null;

  const fields = (
    <View
      className={cn(
        'rounded-24 border border-border bg-surface px-4.5 py-2',
        isTablet && 'flex-grow',
      )}
    >
      {detailRows(tx, account).map((row) => (
        <View
          key={row.label}
          accessible
          accessibilityLabel={`${row.label}: ${row.value}`}
          className="flex-row justify-between gap-3 border-b border-border py-[11px]"
        >
          <Text size={14} tone="muted" style={{ flexShrink: 0 }}>
            {row.label}
          </Text>
          <Text size={14} weight="semibold" align="right" style={{ flex: 1, minWidth: 0 }}>
            {/* Statement codes ("LOJAELETRON*ONLINE SP") may break after "*" instead of mid-word. */}
            {row.value.replace(/\*/g, '*\u200B')}
          </Text>
        </View>
      ))}
    </View>
  );

  const categories = (
    <SectionCard
      title="Categoria"
      titleSize={17}
      padding={18}
      gap={12}
      description="Toque para mudar · vale para compras parecidas"
    >
      <View className="flex-row flex-wrap gap-2">
        {quick.map((id) => (
          <Chip
            key={id}
            label={CATEGORY_LABELS[id]}
            selected={id === current}
            appearance="filled"
            textSize={14}
            onPress={() => choose(id)}
          />
        ))}
        <Chip
          label="Outra…"
          selected={false}
          appearance="filled"
          textSize={14}
          accessibilityLabel="Outra categoria"
          onPress={() => setOtherOpen(true)}
        />
      </View>
      <Checkbox
        checked={forMerchant}
        onChange={toggleMerchant}
        tone="brand"
        labelWeight="bold"
        label={`Usar “${currentLabel}” para esta loja nas próximas vezes`}
      />
    </SectionCard>
  );

  const budgetInfo = note ? (
    <InfoNote icon="info" size={13} className="rounded-14 px-3.5 py-3">
      {note}
    </InfoNote>
  ) : null;

  const actions = (
    <SectionCard title="Mais ações" titleSize={17} padding={18} gap={6}>
      <View>
        <ActionRow
          icon="copy"
          title={tx.markedDuplicate ? 'Desmarcar duplicado' : 'Marcar como duplicado'}
          description={
            tx.markedDuplicate
              ? 'Volta a contar nos totais e nos tetos'
              : 'Some do total se o mesmo gasto apareceu duas vezes'
          }
          onPress={() => {
            if (!tx.markedDuplicate) return setDuplicateOpen(true);
            store.setDuplicate(tx.id, false);
            toast.success('Voltou a contar nos totais');
          }}
        />
        <ActionRow
          icon="repeat"
          title="Não é assinatura"
          description={
            notSubscription
              ? 'Você já avisou que esta loja não é assinatura'
              : 'Para de tratar esta loja como cobrança recorrente'
          }
          disabled={notSubscription}
          onPress={() => {
            store.markNotSubscription(base);
            toast.success(`Certo: ${name} não será tratada como assinatura`);
          }}
        />
        <ActionRow
          icon="pencil"
          title={tx.note ? 'Editar observação' : 'Adicionar observação'}
          onPress={openNote}
        />
        <ActionRow
          icon="eye"
          title={tx.hiddenFromReports ? 'Mostrar nos relatórios' : 'Esconder dos relatórios'}
          last
          onPress={() => {
            store.setHidden(tx.id, !tx.hiddenFromReports);
            toast.success(
              tx.hiddenFromReports ? 'Volta a aparecer nos relatórios' : 'Escondido dos relatórios',
            );
          }}
        />
      </View>
    </SectionCard>
  );

  const shareButton = (
    <IconButton icon="share" accessibilityLabel="Compartilhar comprovante" onPress={share} />
  );

  let body: ReactNode;
  if (isTablet) {
    body = (
      <>
        <PageHeader
          title={name}
          breadcrumb={{
            parents: [
              { label: 'Gastos', href: '/spending' },
              { label: 'Lançamentos', href: '/spending/transactions' },
            ],
            current: name,
          }}
          actions={shareButton}
        />
        {hero}
        <View className="flex-row gap-4">
          <View className="min-w-0 flex-1 gap-4">
            {quero}
            {budgetInfo}
            {fields}
          </View>
          <View className="min-w-0 flex-1 gap-4">
            {categories}
            <FillColumn>{actions}</FillColumn>
          </View>
        </View>
      </>
    );
  } else {
    body = (
      <>
        {hero}
        {quero}
        {fields}
        {categories}
        {budgetInfo}
        {actions}
      </>
    );
  }

  const options = (tx.direction === 'in' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((id) => ({
    value: id,
    label: CATEGORY_LABELS[id],
  }));

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Lançamento"
              fallbackHref="/spending/transactions"
              actions={shareButton}
            />
          )
        }
        contentClassName={isTablet ? 'pb-32' : 'pb-10'}
      >
        <ScreenStates
          status={status}
          errorTitle="Não deu para carregar o lançamento"
          onRetry={ledger.refetch}
          offline={{
            since: lastUpdateLabel(SPENDING.syncedAt),
            paused: 'Mudar a categoria volta quando a conexão voltar.',
          }}
        >
          {body}
        </ScreenStates>
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <OptionSheet
        open={otherOpen}
        onClose={() => setOtherOpen(false)}
        title="Categoria"
        value={current ?? 'other'}
        options={options}
        onChange={choose}
      />
      <ConfirmDialog
        open={duplicateOpen}
        title="Marcar como duplicado?"
        message="Este lançamento deixa de contar nos totais e nos tetos. Dá para desfazer depois."
        confirmLabel="Marcar"
        onCancel={() => setDuplicateOpen(false)}
        onConfirm={() => {
          store.setDuplicate(tx.id, true);
          setDuplicateOpen(false);
          toast.success('Marcado como duplicado');
        }}
      />
      <ConfirmDialog
        open={reportOpen}
        title="Não reconhece esta compra?"
        message="Vamos marcar como suspeita. Bloqueie o cartão no app do banco e conteste a compra com ele."
        confirmLabel="Não reconheço"
        destructive
        onCancel={() => setReportOpen(false)}
        onConfirm={() => {
          store.setUnusualStatus(tx.id, 'reported');
          setReportOpen(false);
          toast.info('Compra marcada como não reconhecida');
        }}
      />
      <Sheet open={noteOpen} onClose={() => setNoteOpen(false)} title="Observação">
        <View className="gap-4">
          <Input
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="Ex.: presente de aniversário da Ana"
            accessibilityLabel="Observação"
            maxLength={280}
            autoFocus
          />
          <Button fullWidth onPress={saveNote}>
            Salvar observação
          </Button>
        </View>
      </Sheet>
    </View>
  );
}
