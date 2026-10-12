import type { InvestorProfileType } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatDate } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Badge, Button, Icon, Span, Text } from '@/components/ui';
import {
  ALLOCATION_GROUPS,
  PROFILE_AUDIENCE,
  SUBCLASSES,
  TARGET_ALLOCATIONS,
  subclassLabel,
} from '@/constants/target-allocations';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';
import { ChatFab } from '@/navigation';

import { TargetRing } from '../components/allocation';
import { useAllocation } from '../hooks/useAllocation';
import { shareText, shareToMove } from '../lib/allocation';

const PROFILE_TYPES: readonly InvestorProfileType[] = [
  'conservative',
  'moderate',
  'aggressive',
  'sophisticated',
];
/** The 4 profiles share one bar scale (the biggest target, 75%, fills 94%). */
const BAR_SCALE = 80;
const REDO_PROFILE = '/account/investor-profile';

function SubclassList({ type }: { type: InvestorProfileType }) {
  const subclasses = TARGET_ALLOCATIONS[type];
  const [open, setOpen] = useState(false);
  return (
    <View className="border-t border-border pt-1.5">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          haptics.selection();
          setOpen((value) => !value);
        }}
        className="min-h-10 flex-row items-center gap-1.5"
      >
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <Icon name="chevronRight" size={16} color={colors.foreground.DEFAULT} />
        </View>
        <Text size={14} weight="bold">
          {`Ver as ${subclasses.length} subclasses`}
        </Text>
      </Pressable>
      {open
        ? ALLOCATION_GROUPS.map((group) => {
            const items = subclasses.filter(
              (item) => SUBCLASSES[item.subclass].group === group.key,
            );
            if (!items.length) return null;
            return (
              <View key={group.key}>
                <Text
                  size={12}
                  weight="bold"
                  tone="subtle"
                  className="pb-1 pt-2 uppercase"
                  style={{ letterSpacing: 0.5 }}
                >
                  {group.label}
                </Text>
                {items.map((item) => (
                  <View
                    key={item.subclass}
                    accessible
                    className="flex-row justify-between gap-2.5 border-b border-border py-[5px]"
                  >
                    <Text size={13} className="min-w-0 flex-shrink">
                      {subclassLabel(type, item.subclass)}
                    </Text>
                    <Text size={13} weight="bold" tabular>
                      {shareText(item.share)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })
        : null}
    </View>
  );
}

function ProfileCard({ type }: { type: InvestorProfileType }) {
  const { isTablet } = useBreakpoint();
  const { label, groups, savedType } = useAllocation(type);
  const mine = type === savedType;
  return (
    <SectionCard
      padding={20}
      gap={12}
      className={mine ? 'border-2 border-brand-border' : undefined}
    >
      <View className="flex-row items-center gap-2">
        <Text serif weight="bold" size={19} className="flex-1" accessibilityRole="header">
          {label}
        </Text>
        {mine ? <Badge tone="brand" label="Seu perfil" /> : null}
      </View>
      <Text size={14} tone="muted" leading={1.55}>
        {PROFILE_AUDIENCE[type]}
      </Text>
      <View className="items-center">
        <TargetRing groups={groups} profileLabel={label} size={isTablet ? 130 : 132} />
      </View>
      <View>
        {groups.map((group) => (
          <View
            key={group.key}
            accessible
            accessibilityLabel={`${group.label}: ${shareText(group.target)}`}
            className="gap-[5px] py-[7px]"
          >
            <View className="flex-row items-center gap-2">
              <View
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ backgroundColor: group.color }}
              />
              <Text size={13} className="min-w-0 flex-1">
                {group.label}
              </Text>
              <Text size={13} weight="bold" tabular>
                {shareText(group.target)}
              </Text>
            </View>
            <View className="h-1.5 rounded-[3px] bg-surface-muted" style={{ borderRadius: 3 }}>
              <View
                style={{
                  width: `${Math.min(100, (group.target / BAR_SCALE) * 100)}%`,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: group.color,
                }}
              />
            </View>
          </View>
        ))}
      </View>
      <View className="rounded-14 bg-surface-input px-3.5 py-3">
        <Text size={13} tone="muted" leading={1.5}>
          Para ficar igual a este perfil,{' '}
          <Span weight="bold" tone="default">
            {`${shareText(shareToMove(groups))} da sua carteira`}
          </Span>{' '}
          mudaria de grupo.
        </Text>
      </View>
      <SubclassList type={type} />
    </SectionCard>
  );
}

/** "Os 4 perfis": the target allocation of every investor profile, the user's one marked. */
export function AllocationProfilesScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { label, answeredOn } = useAllocation();

  const intro = (
    <Text size={isTablet ? 15 : 14} tone="muted" leading={1.55}>
      {`Cada perfil divide a carteira em 5 grupos e suas subclasses. O seu, definido pelo questionário em ${formatDate(answeredOn)}, é o `}
      <Span weight="bold" tone="default">
        {label}
      </Span>
      . Os outros aparecem para comparar.
    </Text>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Os 4 perfis"
              subtitle="Carteira-alvo de cada perfil"
              fallbackHref="/investments/allocation"
            />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title="Os 4 perfis de investidor"
            subtitle="Carteira-alvo de cada perfil, em 5 grupos"
            breadcrumb={{
              parents: [
                { label: 'Investimentos', href: '/investments' },
                { label: 'Alocação', href: '/investments/allocation' },
              ],
              current: 'Os 4 perfis',
            }}
            actions={
              <Button variant="secondary" size="md" onPress={() => router.navigate(REDO_PROFILE)}>
                Refazer o questionário
              </Button>
            }
          />
        ) : null}
        {intro}
        <ResponsiveGrid>
          {PROFILE_TYPES.map((type) => (
            <ProfileCard key={type} type={type} />
          ))}
        </ResponsiveGrid>
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
