import { colors } from '@guara/ui-tokens';
import { formatCents } from '@guara/utils';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon, Span, Text, type TextTone } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import {
  differenceText,
  differenceTone,
  shareText,
  type DifferenceTone,
  type GroupRow,
  type SubclassRow,
} from '../../lib/allocation';

const TONE: Record<DifferenceTone, TextTone> = {
  close: 'subtle',
  above: 'negative',
  below: 'info',
};

/** "+17,2 p.p." in the color of the gap (Urucum above, Arara-azul below, neutral when close). */
export function DifferenceValue({ difference, size = 13 }: { difference: number; size?: number }) {
  return (
    <Text
      size={size}
      weight="bold"
      tabular
      tone={TONE[differenceTone(difference)]}
      align="right"
      style={{ minWidth: 72 }}
    >
      {differenceText(difference)}
    </Text>
  );
}

/** Bar of the portfolio with the white mark of the target. */
function TargetBar({
  current,
  target,
  scale,
  color,
  height,
}: {
  current: number;
  target: number;
  scale: number;
  color: string;
  height: 8 | 10;
}) {
  return (
    <View
      className="justify-center rounded-full bg-surface-muted"
      style={{ height, borderRadius: height / 2 }}
    >
      <View
        style={{
          width: `${Math.min(100, (current / scale) * 100)}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
      <View
        className="absolute w-0.5 rounded-[1px] bg-foreground"
        style={{
          left: `${Math.min(100, (target / scale) * 100)}%`,
          marginLeft: -1,
          top: -4,
          height: height + 8,
        }}
      />
    </View>
  );
}

function Numbers({
  target,
  current,
  difference,
}: {
  target: number;
  current: number;
  difference: number;
}) {
  return (
    <>
      <Text size={13} tone="subtle" tabular>
        alvo{' '}
        <Span weight="bold" tone="default">
          {shareText(target)}
        </Span>
      </Text>
      <Text size={13} tone="subtle" tabular>
        atual{' '}
        <Span weight="bold" tone="default">
          {shareText(current)}
        </Span>
      </Text>
      <DifferenceValue difference={difference} />
    </>
  );
}

function SubclassLine({ item, wide }: { item: SubclassRow; wide: boolean }) {
  const caption = item.holdings
    ? `${item.holdings.label} · ${formatCents(item.holdings.value)}`
    : null;
  const numbers = (
    <View className="flex-row items-baseline gap-3">
      <Text size={13} tone="subtle" tabular>
        {`alvo ${shareText(item.target)}`}
      </Text>
      <Text size={13} weight="bold" tabular>
        {shareText(item.current)}
      </Text>
      <DifferenceValue difference={item.difference} />
    </View>
  );
  return (
    <View
      accessible
      accessibilityLabel={`${item.label}${caption ? `, ${caption}` : ''}: alvo ${shareText(item.target)}, atual ${shareText(item.current)}, ${differenceText(item.difference)}`}
      className={cn(
        'gap-1 border-t border-border py-[9px] pl-[22px]',
        wide && 'flex-row items-center gap-3',
      )}
    >
      <View className={cn('min-w-0', wide && 'flex-1')}>
        <Text size={14} weight="semibold" leading={1.35}>
          {item.label}
        </Text>
        {caption ? (
          <Text size={12} tone="subtle" leading={1.35}>
            {caption}
          </Text>
        ) : null}
      </View>
      {numbers}
    </View>
  );
}

function GroupLine({
  group,
  scale,
  variant,
  open,
  onToggle,
  last,
}: {
  group: GroupRow;
  scale: number;
  variant: 'card' | 'detail';
  open: boolean;
  onToggle: (() => void) | null;
  last: boolean;
}) {
  const { isTablet } = useBreakpoint();
  const detail = variant === 'detail';
  const summary = `${group.label}: alvo ${shareText(group.target)}, atual ${shareText(group.current)}, ${differenceText(group.difference)}`;
  const inlineNumbers = detail && isTablet;
  const header = (
    <View className="flex-row items-center gap-2.5">
      <View
        className={detail ? 'h-3 w-3 rounded-4' : 'h-2.5 w-2.5 rounded-[3px]'}
        style={{ backgroundColor: group.color }}
      />
      <Text
        size={detail ? 15 : 14}
        weight={detail ? 'bold' : 'semibold'}
        className="min-w-0 flex-1"
      >
        {group.label}
      </Text>
      {inlineNumbers ? (
        <View className="flex-row items-baseline gap-3.5">
          <Numbers target={group.target} current={group.current} difference={group.difference} />
        </View>
      ) : null}
      {onToggle ? (
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <Icon name="chevronRight" size={16} color={colors.foreground.subtle} />
        </View>
      ) : null}
    </View>
  );
  const bar = (
    <TargetBar
      current={group.current}
      target={group.target}
      scale={scale}
      color={group.color}
      height={detail ? 10 : 8}
    />
  );
  const numbers = inlineNumbers ? null : (
    <View
      className={cn('flex-row items-baseline gap-3', detail ? 'justify-between' : 'justify-end')}
    >
      <Numbers target={group.target} current={group.current} difference={group.difference} />
    </View>
  );

  return (
    <View className={cn(detail ? 'py-3' : 'py-2', detail && !last && 'border-b border-border')}>
      {onToggle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={summary}
          accessibilityHint="Mostra as subclasses"
          accessibilityState={{ expanded: open }}
          onPress={() => {
            haptics.selection();
            onToggle();
          }}
          className="gap-2"
        >
          {header}
          {bar}
          {numbers}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={summary} className={detail ? 'gap-2' : 'gap-1.5'}>
          {header}
          {bar}
          {numbers}
        </View>
      )}
      {open ? (
        <View className="mt-2.5">
          {group.subclasses.map((item) => (
            <SubclassLine key={item.key} item={item} wide={isTablet} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * "Grupo × alvo" (Fundamentos): each group's bar against the white mark of the target, with
 * the difference in p.p. `detail` opens the subclasses on tap (Alocação, profile result).
 */
export function GroupTargetList({
  groups,
  scale,
  variant = 'detail',
  defaultOpen = [],
}: {
  groups: readonly GroupRow[];
  scale: number;
  variant?: 'card' | 'detail';
  /** Groups that start open. */
  defaultOpen?: readonly string[];
}) {
  const [open, setOpen] = useState<readonly string[]>(defaultOpen);
  return (
    <View>
      {groups.map((group, index) => (
        <GroupLine
          key={group.key}
          group={group}
          scale={scale}
          variant={variant}
          open={variant === 'detail' && open.includes(group.key)}
          onToggle={
            variant === 'detail'
              ? () =>
                  setOpen((current) =>
                    current.includes(group.key)
                      ? current.filter((key) => key !== group.key)
                      : [...current, group.key],
                  )
              : null
          }
          last={index === groups.length - 1}
        />
      ))}
    </View>
  );
}
