import { colors } from '@guara/ui-tokens';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AllocationBar } from '@/components/charts';
import { StateSlot } from '@/components/feedback';
import {
  Badge,
  Card,
  IconButton,
  LinkButton,
  MoneyText,
  ProgressBar,
  SkeletonBlock,
  Span,
  Text,
  useMoneyFormat,
} from '@/components/ui';
import { ASSISTANTS } from '@/features/chat';
import { cn } from '@/lib/cn';
import { conversationHref } from '@/navigation';

import type { TeamCardData } from '../data';

export interface AssistantCardProps {
  card: TeamCardData;
  /** Height of the scene (design: 150 list, 160 carousel, 184 tablet). */
  imageHeight?: number;
  className?: string;
}

/** Card of an assistant: scene with biome and status, metric, highlight, quote and actions. */
export function AssistantCard({ card, imageHeight = 160, className }: AssistantCardProps) {
  const router = useRouter();
  const meta = ASSISTANTS[card.assistant];
  const { highlight } = card;
  const { mask } = useMoneyFormat();

  return (
    <Card padding="none" className={cn('rounded-28', card.alert && 'border-negative', className)}>
      <StateSlot>
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Imagem do agente ${meta.name}`}
          style={{ height: imageHeight }}
          className="overflow-hidden rounded-t-22"
        >
          <SkeletonBlock radius={0} className="absolute inset-0">
            <Image
              source={meta.scene}
              style={{ width: '100%', height: imageHeight }}
              contentFit="cover"
            />
          </SkeletonBlock>
          <View className="absolute right-3.5 top-3.5 rounded-full bg-scrim-soft px-2.5 py-1">
            <Text size={12} weight="bold" leading={1.5}>
              {meta.biome}
            </Text>
          </View>
          <View className="absolute left-3.5 top-3.5">
            <Badge
              label={card.status}
              appearance={card.alert ? 'solid' : 'scrim'}
              tone={card.alert ? 'negative' : 'neutral'}
            />
          </View>
        </View>
        <View className="flex-grow gap-2.5 px-5 pb-4.5 pt-4">
          <View className="flex-row items-baseline justify-between gap-2">
            <View className="min-w-0 flex-shrink gap-0.5">
              <Text serif weight="extrabold" size={24} leading={1.1}>
                {meta.name}
              </Text>
              <Text serif italic size={13} leading={1.2} tone="subtle">
                {meta.scientificName}
              </Text>
            </View>
            <Text size={13} weight="bold" tone="muted" className="flex-shrink-0">
              {meta.area}
            </Text>
          </View>
          <View className="gap-0.5">
            {card.metric.kind === 'money' ? (
              <MoneyText
                value={card.metric.value}
                serif
                weight="extrabold"
                size={28}
                leading={1.1}
              />
            ) : (
              <Text
                serif
                weight="extrabold"
                size={28}
                leading={1.1}
                tabular
                tone={card.alert ? 'negative' : 'default'}
              >
                {card.metric.value}
              </Text>
            )}
            <Text variant="caption" tone="subtle">
              {card.metricCaption}
            </Text>
          </View>
          {highlight.type === 'note' ? (
            <View className="flex-row items-center gap-2 rounded-12 bg-surface-muted px-2.5 py-2">
              <View
                className={cn(
                  'h-2 w-2 rounded-full',
                  highlight.dot === 'negative' ? 'bg-negative' : 'bg-positive',
                )}
              />
              <Text size={13} className="flex-1">
                <Span weight="bold">{highlight.strong}</Span> {highlight.text}
              </Text>
            </View>
          ) : null}
          {highlight.type === 'alert' ? (
            <View className="flex-row items-center gap-2 rounded-12 bg-negative-muted px-2.5 py-2">
              <Text size={13} className="flex-1">
                <MoneyText value={highlight.amount} size={13} weight="bold" /> {highlight.text}
              </Text>
            </View>
          ) : null}
          {highlight.type === 'allocation' ? (
            <View className="gap-1.5">
              <Text size={13} tone="muted">
                <Span weight="bold" tone="positive">
                  {highlight.change}
                </Span>{' '}
                {highlight.text}
              </Text>
              <AllocationBar segments={highlight.segments} />
            </View>
          ) : null}
          {highlight.type === 'progress' ? (
            <View className="gap-1.5">
              <Text size={13} tone="muted">
                <Span weight="bold" tone="default">
                  {highlight.strong}
                </Span>{' '}
                {highlight.text}
              </Text>
              <ProgressBar
                percent={highlight.percent}
                tone="warning"
                height={8}
                accessibilityLabel={`${highlight.strong} ${highlight.text}`}
              />
            </View>
          ) : null}
          <Text size={14} leading={1.4} tone="muted" italic>
            {mask(card.quote)}
          </Text>
          <View className="mt-auto flex-row items-center justify-between gap-2">
            <LinkButton
              label={card.link.label}
              tone={card.alert ? 'negative' : 'default'}
              onPress={() => router.navigate(card.link.href)}
            />
            <IconButton
              icon="message"
              variant="outline"
              color={colors.foreground.muted}
              accessibilityLabel={`Conversar com ${meta.name}`}
              onPress={() => router.navigate(conversationHref())}
            />
          </View>
        </View>
      </StateSlot>
    </Card>
  );
}
