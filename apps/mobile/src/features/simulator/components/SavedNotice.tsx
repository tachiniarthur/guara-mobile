import { formatDate } from '@guara/utils';
import { View } from 'react-native';

import { InfoNote, LinkButton, Text } from '@/components/ui';

import type { SavedSimulation } from '../data';

export interface SavedNoticeProps {
  simulation: SavedSimulation;
  /** Shown when today's numbers differ from the saved ones ("Usar os dados de hoje"). */
  onRefresh?: () => void;
}

/** Note on top of a simulation opened from "Simulações salvas". */
export function SavedNotice({ simulation, onRefresh }: SavedNoticeProps) {
  return (
    <InfoNote icon="clock" className="rounded-14 px-3.5 py-3">
      <View className="gap-1.5">
        <Text size={13} leading={1.5} tone="muted">
          {`“${simulation.name}”, salva em ${formatDate(simulation.savedOn)}, com os números daquele dia.`}
        </Text>
        {onRefresh ? (
          <LinkButton
            label="Usar os dados de hoje"
            size={13}
            onPress={onRefresh}
            className="self-start"
          />
        ) : null}
      </View>
    </InfoNote>
  );
}
