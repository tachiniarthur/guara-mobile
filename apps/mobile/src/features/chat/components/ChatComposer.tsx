import { colors, fontFamily } from '@guara/ui-tokens';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';

import { toast } from '@/components/feedback';
import { Icon, IconButton, Text } from '@/components/ui';
import { isApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';
import { pickChatImage, pickPdf, type PickedFile } from '@/lib/media';
import { transcribeAudio } from '@/lib/transcription';
import { useVoiceRecorder } from '@/lib/voice';

import type { ChatFile } from '../data';
import { useQuestionLimit } from '../hooks/useQuestionLimit';

import { ChatLimitNotice } from './ChatLimitNotice';
import { UploadError, uploadAttachment } from '../api/upload';

import {
  AttachSheet,
  AttachmentChip,
  MAX_ATTACHMENT_BYTES,
  type AttachmentUpload,
} from './ComposerAttachments';

export interface ChatComposerProps {
  onSend: (text: string, attachment?: ChatFile) => void;
  onPickAssistant: () => void;
  suggestions?: readonly string[];
  placeholder?: string;
  /** Tablet: 40-tall suggestions. */
  large?: boolean;
  /** An answer is being written: send becomes "Parar a resposta". */
  streaming?: boolean;
  onStop?: () => void;
}

/** Bars of the waveform while recording (newest on the right). */
const BARS = 28;
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png'];

/** "0:07". */
function clock(millis: number): string {
  const seconds = Math.floor(millis / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Metering (dB, about −60 to 0) → bar height 4–24. */
const barHeight = (db: number) => 4 + Math.round(Math.max(0, Math.min(1, (db + 60) / 60)) * 20);

function toChatFile(file: PickedFile): ChatFile | null {
  if (!ACCEPTED.includes(file.mimeType)) {
    toast.error('Mande um PDF, JPG ou PNG.');
    return null;
  }
  if (file.size !== null && file.size > MAX_ATTACHMENT_BYTES) {
    toast.error('O arquivo passa de 10 MB. Mande um menor.');
    return null;
  }
  return {
    uri: file.uri,
    name: file.name,
    kind: file.mimeType === 'application/pdf' ? 'pdf' : 'image',
    sizeBytes: file.size,
  };
}

type Mode = 'idle' | 'recording' | 'transcribing';

/** Suggestions + pill field with attach, "@" (pick an assistant), voice and send. */
export function ChatComposer({
  onSend,
  onPickAssistant,
  suggestions = [],
  placeholder = 'Pergunte qualquer coisa',
  large = false,
  streaming = false,
  onStop,
}: ChatComposerProps) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<ChatFile | null>(null);
  const [upload, setUpload] = useState<AttachmentUpload | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('idle');
  const [recorded, setRecorded] = useState(0);
  const [controller, setController] = useState<AbortController | null>(null);
  const voice = useVoiceRecorder();
  const limit = useQuestionLimit();
  // "Entendi" hides the notice; trying to send again brings it back.
  const [limitDismissed, setLimitDismissed] = useState(false);
  const showLimit = limit.reached && !limitDismissed;

  // Each metering sample becomes a bar of the waveform.
  const levels = voice.levels.map(barHeight);

  const send = async (value = text) => {
    const message = value.trim();
    if (!message && !attachment) return;
    if (streaming || upload?.state === 'sending') return;
    if (limit.reached) {
      setLimitDismissed(false);
      return;
    }
    haptics.impact();
    // The file goes first; if the connection drops, it stays here to try again.
    if (attachment) {
      setUpload({ state: 'sending', percent: 0 });
      try {
        await uploadAttachment(attachment, (percent) => setUpload({ state: 'sending', percent }));
      } catch (error) {
        setUpload({
          state: 'failed',
          percent: error instanceof UploadError ? error.progress : 0,
        });
        return;
      }
      setUpload(null);
    }
    onSend(message, attachment ?? undefined);
    setText('');
    setAttachment(null);
  };

  const pick = async (source: 'camera' | 'library' | 'pdf') => {
    const file = source === 'pdf' ? await pickPdf() : await pickChatImage(source);
    const chatFile = file ? toChatFile(file) : null;
    if (chatFile) setAttachment(chatFile);
  };

  const startRecording = async () => {
    haptics.selection();
    const result = await voice.start();
    if (result === 'denied') {
      toast.error('Libere o microfone nos ajustes do celular para falar com os assistentes.');
      return;
    }
    if (result === 'failed') {
      toast.error('Não deu para começar a gravar. Tente de novo.');
      return;
    }
    setMode('recording');
  };

  const cancel = async () => {
    controller?.abort();
    setController(null);
    if (mode === 'recording') await voice.cancel();
    setMode('idle');
  };

  const stopAndTranscribe = async () => {
    haptics.impact();
    const recording = await voice.stop();
    if (!recording) {
      setMode('idle');
      toast.error('Não deu para salvar o áudio. Tente de novo.');
      return;
    }
    setRecorded(recording.durationMillis);
    setMode('transcribing');
    const abort = new AbortController();
    setController(abort);
    try {
      const transcription = await transcribeAudio(recording.uri, abort.signal);
      setText((current) => [current.trim(), transcription.text.trim()].filter(Boolean).join(' '));
    } catch (error) {
      if (!abort.signal.aborted) {
        toast.error(
          isApiError(error)
            ? `Não deu para transcrever. ${error.message}`
            : 'Não deu para transcrever. Digite sua pergunta.',
        );
      }
    } finally {
      setController(null);
      setMode('idle');
    }
  };

  const seconds = Math.max(1, Math.round(recorded / 1000));

  return (
    <View className="gap-2">
      {suggestions.length && mode === 'idle' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Sugestões"
          contentContainerClassName="gap-2"
          keyboardShouldPersistTaps="handled"
        >
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              accessibilityRole="button"
              onPress={() => void send(suggestion)}
              className={cn(
                'justify-center rounded-full border border-border-strong px-4 active:bg-surface-pressed',
                large ? 'h-10' : 'h-9',
              )}
            >
              <Text size={14}>{suggestion}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {showLimit ? <ChatLimitNotice onDismiss={() => setLimitDismissed(true)} /> : null}
      {attachment && mode === 'idle' && !showLimit ? (
        <AttachmentChip
          file={attachment}
          upload={upload}
          onRetry={() => void send()}
          onRemove={() => {
            setUpload(null);
            setAttachment(null);
          }}
        />
      ) : null}
      {showLimit ? null : mode === 'idle' ? (
        <View className="min-h-14 flex-row items-center gap-0.5 rounded-full border border-border-strong bg-surface-input p-1.5">
          <IconButton
            icon="paperclip"
            accessibilityLabel="Anexar arquivo"
            onPress={() => setAttachOpen(true)}
          />
          <IconButton
            icon="atSign"
            accessibilityLabel="Falar com um bicho específico"
            onPress={onPickAssistant}
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.foreground.subtle}
            selectionColor={colors.brand.DEFAULT}
            cursorColor={colors.brand.DEFAULT}
            accessibilityLabel="Mensagem"
            returnKeyType="send"
            onSubmitEditing={() => void send()}
            className="h-11 min-w-0 flex-1 pl-1 text-foreground"
            style={{ fontFamily: fontFamily.regular, fontSize: 15 }}
          />
          <IconButton icon="mic" accessibilityLabel="Falar" onPress={startRecording} />
          {streaming ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Parar a resposta"
              onPress={() => {
                haptics.selection();
                onStop?.();
              }}
              className="h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface-muted active:bg-surface-pressed"
            >
              <Icon name="stop" size={18} color={colors.foreground.DEFAULT} />
            </Pressable>
          ) : (
            <IconButton
              icon="arrowRight"
              variant="primary"
              accessibilityLabel="Enviar mensagem"
              onPress={() => void send()}
            />
          )}
        </View>
      ) : (
        <View className="gap-1.5">
          <View
            className={cn(
              'min-h-14 flex-row items-center gap-2 rounded-full border bg-surface-input py-1.5 pl-2 pr-1.5',
              mode === 'recording' ? 'border-brand' : 'border-border-strong',
            )}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar gravação"
              onPress={cancel}
              className="h-11 justify-center rounded-full px-3 active:bg-surface-pressed"
            >
              <Text size={14} weight="bold" tone="muted">
                Cancelar
              </Text>
            </Pressable>
            {mode === 'recording' ? (
              <>
                <View
                  accessible
                  accessibilityLabel={`Gravando, ${clock(voice.durationMillis)}`}
                  className="flex-row items-center gap-2"
                >
                  <View className="h-2.5 w-2.5 rounded-full bg-negative" />
                  <Text weight="bold" tabular>
                    {clock(voice.durationMillis)}
                  </Text>
                </View>
                <View
                  importantForAccessibility="no-hide-descendants"
                  className="h-8 min-w-0 flex-1 flex-row items-center gap-[3px] overflow-hidden"
                >
                  {Array.from({ length: BARS }, (_, index) => {
                    const level = levels[index - (BARS - levels.length)];
                    return (
                      <View
                        key={index}
                        className={cn(
                          'w-[3px] rounded-[2px]',
                          level ? 'bg-brand' : 'bg-border-strong',
                        )}
                        style={{ height: level ?? 8 }}
                      />
                    );
                  })}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Parar e transcrever"
                  onPress={stopAndTranscribe}
                  className="h-11 w-11 items-center justify-center rounded-full bg-brand active:opacity-90"
                >
                  <Icon name="stop" size={20} color={colors.brand.foreground} />
                </Pressable>
              </>
            ) : (
              <>
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <ActivityIndicator size="small" color={colors.brand.DEFAULT} />
                  <Text size={15} numberOfLines={1} className="min-w-0 flex-1">
                    Transcrevendo…
                  </Text>
                </View>
                <View
                  accessibilityRole="button"
                  accessibilityLabel="Enviar"
                  accessibilityState={{ disabled: true }}
                  className="h-11 w-11 items-center justify-center rounded-full bg-border-strong"
                >
                  <Icon name="arrowRight" size={20} color={colors.foreground.subtle} />
                </View>
              </>
            )}
          </View>
          <Text size={12} tone="subtle" align="center" accessibilityLiveRegion="polite">
            {mode === 'recording'
              ? 'Gravando… fale sua pergunta. Toque no quadrado para parar.'
              : `Transcrevendo o áudio de ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}. Você pode editar antes de enviar.`}
          </Text>
        </View>
      )}
      <AttachSheet open={attachOpen} onClose={() => setAttachOpen(false)} onPick={pick} />
    </View>
  );
}
