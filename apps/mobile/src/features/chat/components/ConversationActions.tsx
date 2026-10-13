import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { toast } from '@/components/feedback';
import {
  Button,
  ConfirmDialog,
  Icon,
  IconButton,
  Input,
  Sheet,
  Text,
  type IconName,
} from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { sharePdf, shareText } from '@/lib/share';

import { ASSISTANTS } from '../assistants';
import type { ChatMessage, RichText } from '../data';
import { useChatStore } from '../store';

const plain = (content: RichText) =>
  content.map((part) => (typeof part === 'string' ? part : part.strong)).join('');

/** Text of a message ("Você: …", "Tamanduá: …"). */
function messageText(message: ChatMessage): string {
  if (message.role === 'user') return `Você: ${message.text}`;
  if (message.role === 'unavailable') {
    return `${ASSISTANTS[message.assistant].name}: não respondeu.`;
  }
  const text = message.blocks
    .map((block) => (block.type === 'text' ? plain(block.content) : block.label))
    .join(' ');
  return `${ASSISTANTS[message.assistant].name}: ${text}`;
}

/** Summary to share: no money values ("R$ •••"), as the menu promises. */
export function shareSummary(title: string, messages: readonly ChatMessage[]): string {
  const lines = messages.map((message) => messageText(message).replace(/R\$\s?[\d.,]+/g, 'R$ •••'));
  return [`${title} · conversa no Guará`, '', ...lines].join('\n');
}

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Simple printable page of the conversation (PDF). */
export function conversationHtml(title: string, messages: readonly ChatMessage[]): string {
  const items = messages
    .map((message) => `<p class="${message.role}">${escape(messageText(message))}</p>`)
    .join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
body{font-family:-apple-system,Roboto,sans-serif;color:#0B110E;padding:32px;line-height:1.5}
h1{font-size:22px;margin:0 0 4px}small{color:#5E6E64}
p{margin:12px 0;padding:10px 12px;border-radius:12px;background:#F2EFE6}p.user{background:#F2C230}
</style></head><body><h1>${escape(title)}</h1><small>Conversa exportada do Guará</small>${items}</body></html>`;
}

function MenuRow({
  icon,
  label,
  caption,
  destructive = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  caption?: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption ? `${label}, ${caption}` : label}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className="min-h-14 flex-row items-center gap-3.5 rounded-16 px-3 py-2.5 active:bg-surface-pressed"
    >
      <Icon
        name={icon}
        size={20}
        color={destructive ? colors.negative.DEFAULT : colors.foreground.muted}
      />
      <View className="min-w-0 flex-1">
        <Text size={15} weight="semibold" tone={destructive ? 'negative' : 'default'}>
          {label}
        </Text>
        {caption ? (
          <Text size={12} tone="subtle">
            {caption}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

type Open = 'menu' | 'rename' | 'delete' | null;

/** "Mais opções da conversa": rename, pin, share, export as PDF and delete. */
export function ConversationActions({ onDeleted }: { onDeleted?: () => void }) {
  const title = useChatStore((state) => state.title);
  const currentId = useChatStore((state) => state.currentId);
  const messages = useChatStore((state) => state.messages);
  const groups = useChatStore((state) => state.groups);
  const rename = useChatStore((state) => state.rename);
  const togglePin = useChatStore((state) => state.togglePin);
  const remove = useChatStore((state) => state.remove);
  const [open, setOpen] = useState<Open>(null);
  const [draft, setDraft] = useState(title);
  const pinned = groups.some((group) =>
    group.items.some((item) => item.id === currentId && item.pinned),
  );
  const close = () => setOpen(null);
  const answeredBy = messages.find((message) => message.role === 'assistant');
  const assistantName =
    answeredBy?.role === 'assistant' ? ASSISTANTS[answeredBy.assistant].name : 'os assistentes';

  return (
    <>
      <IconButton
        icon="moreHorizontal"
        accessibilityLabel="Mais opções da conversa"
        onPress={() => setOpen('menu')}
      />
      <Sheet open={open === 'menu'} onClose={close} title={open === 'menu' ? title : undefined}>
        <View>
          <MenuRow
            icon="pencil"
            label="Renomear conversa"
            caption={`Agora: ${title}`}
            onPress={() => {
              setDraft(title);
              setOpen('rename');
            }}
          />
          {currentId ? (
            <MenuRow
              icon="pin"
              label={pinned ? 'Desafixar' : 'Fixar no topo'}
              caption={pinned ? 'Volta para a ordem do histórico' : 'Fica primeiro no histórico'}
              onPress={() => {
                togglePin(currentId);
                toast.success(pinned ? 'Conversa desafixada' : 'Conversa fixada no topo');
                close();
              }}
            />
          ) : null}
          <MenuRow
            icon="share"
            label="Compartilhar"
            caption="Gera um resumo sem valores de saldo"
            onPress={() => {
              close();
              void shareText(shareSummary(title, messages), title);
            }}
          />
          <MenuRow
            icon="download"
            label="Exportar em PDF"
            onPress={async () => {
              close();
              const ok = await sharePdf(conversationHtml(title, messages), title);
              if (!ok) toast.error('Não deu para gerar o PDF agora. Tente de novo.');
            }}
          />
          {currentId ? (
            <MenuRow
              icon="trash"
              label="Apagar conversa"
              caption="Não dá para desfazer"
              destructive
              onPress={() => setOpen('delete')}
            />
          ) : null}
        </View>
        <Button variant="secondary" fullWidth onPress={close}>
          Cancelar
        </Button>
      </Sheet>
      <Sheet open={open === 'rename'} onClose={close} title="Renomear conversa">
        <Input
          label="Nome da conversa"
          value={draft}
          onChangeText={setDraft}
          maxLength={80}
          autoFocus
        />
        <Button
          fullWidth
          disabled={!draft.trim()}
          onPress={() => {
            rename(draft.trim());
            toast.success('Conversa renomeada');
            close();
          }}
        >
          Salvar nome
        </Button>
      </Sheet>
      <ConfirmDialog
        open={open === 'delete'}
        title="Apagar esta conversa?"
        message={`A conversa “${title}” e as respostas do ${assistantName} somem do histórico. Seus dados de gastos não são apagados.`}
        confirmLabel="Apagar"
        destructive
        onCancel={close}
        onConfirm={() => {
          if (currentId) remove(currentId);
          toast.success('Conversa apagada');
          close();
          onDeleted?.();
        }}
      />
    </>
  );
}
