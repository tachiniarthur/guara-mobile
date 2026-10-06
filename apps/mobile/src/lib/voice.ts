import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

import { logger } from './logger';

export interface VoiceRecording {
  uri: string;
  durationMillis: number;
}

/** Samples kept for the waveform (newest last). */
const LEVELS = 28;
const SAMPLE_MS = 100;

/**
 * Records a spoken question (chat). `start` asks for the microphone; `stop` returns the file;
 * `cancel` throws the audio away. `levels` (dB, about −60 to 0) draw the waveform.
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [durationMillis, setDurationMillis] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);

  const stopSampling = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => stopSampling, []);

  const start = async (): Promise<'recording' | 'denied' | 'failed'> => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) return 'denied';
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setDurationMillis(0);
      setLevels([]);
      stopSampling();
      timer.current = setInterval(() => {
        const status = recorder.getStatus();
        setDurationMillis(status.durationMillis);
        if (status.metering !== undefined) {
          const db = status.metering;
          setLevels((current) => [...current.slice(-(LEVELS - 1)), db]);
        }
      }, SAMPLE_MS);
      return 'recording';
    } catch (error) {
      logger.error('Recording failed to start', { error });
      return 'failed';
    }
  };

  const stop = async (): Promise<VoiceRecording | null> => {
    stopSampling();
    try {
      const duration = recorder.getStatus().durationMillis;
      await recorder.stop();
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      return recorder.uri ? { uri: recorder.uri, durationMillis: duration } : null;
    } catch (error) {
      logger.error('Recording failed to stop', { error });
      return null;
    }
  };

  return {
    durationMillis,
    levels,
    start,
    stop,
    cancel: async () => {
      await stop();
    },
  };
}
