import { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { haptics } from '@/lib/haptics';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
  /** Spoken value ("25 anos"). */
  valueText: string;
}

const THUMB = 20;

function snap(value: number, min: number, max: number, step: number): number {
  const stepped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, Number(stepped.toFixed(6))));
}

/** Range input of the design (Arara-azul track and thumb, 28 tall): tap, drag or adjust. */
export function Slider({
  value,
  min,
  max,
  step,
  onChange,
  accessibilityLabel,
  valueText,
}: SliderProps) {
  const [width, setWidth] = useState(0);

  const moveTo = (x: number) => {
    if (width <= THUMB) return;
    const ratio = Math.min(1, Math.max(0, (x - THUMB / 2) / (width - THUMB)));
    const next = snap(min + ratio * (max - min), min, max, step);
    if (next !== value) {
      haptics.selection();
      onChange(next);
    }
  };
  const adjust = (direction: 1 | -1) => onChange(snap(value + direction * step, min, max, step));

  // Horizontal drags move the thumb; vertical ones stay with the scroll view.
  const drag = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-4, 4])
    .failOffsetY([-10, 10])
    .onUpdate((event) => moveTo(event.x));
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((event) => moveTo(event.x));

  const ratio = max === min ? 0 : (value - min) / (max - min);

  return (
    <GestureDetector gesture={Gesture.Exclusive(drag, tap)}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value, text: valueText }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) =>
          adjust(event.nativeEvent.actionName === 'increment' ? 1 : -1)
        }
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        className="h-7 justify-center"
      >
        <View className="h-1 rounded-full bg-border-strong" style={{ marginHorizontal: THUMB / 2 }}>
          <View className="h-1 rounded-full bg-info" style={{ width: `${ratio * 100}%` }} />
        </View>
        <View
          pointerEvents="none"
          className="absolute h-5 w-5 rounded-full bg-info"
          style={{ left: `${ratio * 100}%`, marginLeft: -ratio * THUMB }}
        />
      </View>
    </GestureDetector>
  );
}
