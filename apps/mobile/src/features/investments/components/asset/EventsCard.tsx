import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { DataTable, EmptyValue, Icon, MoneyText, Text } from '@/components/ui';

import type { EventItem, EventList } from '../../assets';

/** Items listed before "Ver todos" (design: 6 on phones, 8 on tablets). */
const VISIBLE = { phone: 6, tablet: 8 } as const;

export type EventsCardProps = {
  subtitle: string;
  wide?: boolean;
  /** "Ver todos (N)": opens the full history. */
  onSeeAll: () => void;
} & ({ kind: 'note'; text: string } | ({ kind: 'list' } & EventList));

function SeeAll({
  total,
  onPress,
  padded,
}: {
  total: number;
  onPress: () => void;
  padded: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      className={
        padded
          ? 'min-h-11 flex-row items-center gap-1.5 px-4 py-3'
          : 'min-h-6 flex-row items-center gap-1.5 self-start'
      }
    >
      <Text size={14} weight="semibold" tone="muted">
        {`Ver todos (${total})`}
      </Text>
      <Icon name="chevronRight" size={14} color={colors.foreground.muted} />
    </Pressable>
  );
}

function PhoneEvent({ item }: { item: EventItem }) {
  return (
    <View className="flex-row items-center justify-between gap-3 border-b border-border py-3">
      <View>
        <Text size={15} weight="bold" tabular leading={1.35}>
          {item.date}
        </Text>
        <Text size={13} tone="muted" leading={1.35}>
          {item.kind}
        </Text>
      </View>
      <View className="items-end">
        <Text size={15} weight="bold" tabular leading={1.35}>
          {item.perUnit}
        </Text>
        {item.received === null ? (
          <Text size={13} tone="subtle" leading={1.35}>
            você não tinha
          </Text>
        ) : (
          <Text size={13} tone="positive" tabular leading={1.35}>
            você: <MoneyText value={item.received} size={13} tone="positive" leading={1.35} />
          </Text>
        )}
      </View>
    </View>
  );
}

/** Dividends and other payments: a note when the asset pays none, a list (table on tablets) otherwise. */
export function EventsCard(props: EventsCardProps) {
  const { subtitle, wide = false } = props;
  const visible = VISIBLE[wide ? 'tablet' : 'phone'];
  const items = props.kind === 'list' ? props.items.slice(0, visible) : [];
  const toggle = props.onSeeAll;

  return (
    <SectionCard
      title="Eventos corporativos"
      description={subtitle}
      descriptionTone="muted"
      titleSize={wide ? 20 : 18}
      padding={wide ? 20 : 16}
      gap={14}
    >
      {props.kind === 'note' ? (
        <View className="flex-row gap-3 rounded-16 bg-surface-input p-4">
          <View style={{ marginTop: 2 }}>
            <Icon name="info" size={18} color={colors.foreground.subtle} />
          </View>
          <Text size={14} leading={1.55} tone="soft" className="flex-1">
            {props.text}
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row items-center gap-2.5 rounded-14 bg-positive-muted px-3.5 py-3">
            <Icon name="dollar" size={18} color={colors.positive.DEFAULT} />
            <Text size={14} className="flex-1">
              {props.summary}
            </Text>
          </View>
          {wide ? (
            <DataTable
              caption="Eventos corporativos"
              columns={[
                { key: 'date', label: 'Data' },
                { key: 'kind', label: 'Evento' },
                { key: 'value', label: 'Valor', align: 'right' },
                { key: 'received', label: 'Você recebeu', align: 'right' },
              ]}
              rows={items.map((item, index) => ({
                key: `${item.date}-${index}`,
                cells: [
                  <Text key="date" size={14} weight="bold" tabular>
                    {item.date}
                  </Text>,
                  <Text key="kind" size={14} tone="muted">
                    {item.kind}
                  </Text>,
                  <Text key="value" size={14} weight="bold" tabular>
                    {item.perUnit}
                  </Text>,
                  item.received === null ? (
                    <EmptyValue key="received" size={14} weight="bold" />
                  ) : (
                    <MoneyText
                      key="received"
                      value={item.received}
                      showSign
                      size={14}
                      weight="bold"
                      tone="positive"
                    />
                  ),
                ],
              }))}
              footer={<SeeAll total={props.total} onPress={toggle} padded />}
            />
          ) : (
            <>
              <View style={{ marginTop: -4 }}>
                {items.map((item, index) => (
                  <PhoneEvent key={`${item.date}-${index}`} item={item} />
                ))}
              </View>
              <SeeAll total={props.total} onPress={toggle} padded={false} />
            </>
          )}
          <Text size={13} tone="subtle">
            {props.note}
          </Text>
        </>
      )}
    </SectionCard>
  );
}
