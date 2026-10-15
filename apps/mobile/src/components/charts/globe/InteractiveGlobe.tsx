import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Path,
  RadialGradient,
  Skia,
  vec,
  type SkPath,
  type SkPathBuilder,
} from '@shopify/react-native-skia';
import { colors } from '@guara/ui-tokens';
import { useEffect, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui/Text';

import { LAND_DOTS } from './land-dots';

export interface GlobeMarker {
  key: string;
  /** Text of the marker's chip ("Brasil · 82%"). */
  label: string;
  lat: number;
  lon: number;
  color: string;
  /** ISO 3166-1 numeric code: the country's dots take the marker color. */
  countryId?: number;
}

/** Something without a country (Bitcoin): a satellite on the dashed orbit around the globe. */
export interface GlobeOrbit {
  key: string;
  /** Text of the satellite's chip ("Bitcoin · 10%"). */
  label: string;
  color: string;
}

export interface InteractiveGlobeProps {
  markers: readonly GlobeMarker[];
  orbit?: GlobeOrbit;
  selectedKey: string | null;
  /** Picks a place (or `null` to close its details). */
  onSelect: (key: string | null) => void;
  /** Where the globe starts (default: the Americas, a bit of the north, as on the web). */
  initialCenter?: { lat: number; lon: number };
  /** Spin, pulse and orbit (off with reduced motion). */
  autoRotate?: boolean;
  /** Largest side in dp (default 300). */
  maxSize?: number;
  accessibilityLabel: string;
}

/*
 * The same globe as the web app (features/investimentos/globe): sizes are fractions of the
 * square, so both draw the same picture at any size.
 */
const DEG = Math.PI / 180;
const GLOBE_RATIO = 0.4;
const ORBIT_RX = 0.472;
const ORBIT_RY = 0.144;
const ORBIT_TILT = -18 * DEG;
const MAX_TILT = 65;
/** Idle spin in degrees per second; it comes back 4 s after the last touch. */
const AUTO_SPEED = 4;
const IDLE_RESUME_MS = 4000;
/** The satellite goes round once a minute. */
const ORBIT_SPEED = 6;
const PULSE_MS = 2400;
const FOCUS_MS = 700;
/** Inertia after a drag: the web keeps 93% of the speed each frame (60 fps). */
const INERTIA = 0.93;
/** Highlight colors drawn over the land (one path per color and depth band). */
const MAX_HIGHLIGHTS = 4;
const BANDS = 4;
const BAND_OPACITY = [0.35, 0.6, 0.85, 1] as const;
/** Gap between a marker and its chip, and the room kept between chips. */
const LABEL_GAP = 12;
const LABEL_PAD = 4;

/** Per dot: sin(lat), cos(lat), lon in radians — computed once for every frame. */
const DOT_GEO: number[] = [];
const DOT_COUNTRY: number[] = [];
for (let index = 0; index < LAND_DOTS.length; index += 3) {
  const lat = ((LAND_DOTS[index] ?? 0) / 10) * DEG;
  DOT_GEO.push(Math.sin(lat), Math.cos(lat), ((LAND_DOTS[index + 1] ?? 0) / 10) * DEG);
  DOT_COUNTRY.push(LAND_DOTS[index + 2] ?? 0);
}

/** Meridians every 30° (sampled every 5°) and parallels every 30° up to 60°. */
const GRID_LINES: number[][] = [];
for (let lon = -180; lon < 180; lon += 30) {
  const line: number[] = [];
  for (let lat = -90; lat <= 90; lat += 5)
    line.push(Math.sin(lat * DEG), Math.cos(lat * DEG), lon * DEG);
  GRID_LINES.push(line);
}
for (let lat = -60; lat <= 60; lat += 30) {
  const line: number[] = [];
  for (let lon = -180; lon <= 180; lon += 5)
    line.push(Math.sin(lat * DEG), Math.cos(lat * DEG), lon * DEG);
  GRID_LINES.push(line);
}

// Jest's Reanimated mocks have no frame callbacks: the globe stays still there.
const useFrame: typeof useFrameCallback =
  typeof useFrameCallback === 'function'
    ? useFrameCallback
    : () => ({ setActive: () => undefined, isActive: false, callbackId: -1 });

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(max, Math.max(min, value));
};

/** Shortest turn from `from` to `to`, in degrees (-180…180]. */
const shortestTurn = (from: number, to: number) => {
  'worklet';
  return ((((to - from) % 360) + 540) % 360) - 180;
};

/** Orthographic projection: screen x, y and how much the point faces the viewer (z). */
const project = (
  sinLat: number,
  cosLat: number,
  lon: number,
  sin0: number,
  cos0: number,
  lon0: number,
  radius: number,
  center: number,
) => {
  'worklet';
  const dl = lon - lon0;
  const cosDl = Math.cos(dl);
  const z = sin0 * sinLat + cos0 * cosLat * cosDl;
  const x = center + radius * cosLat * Math.sin(dl);
  const y = center - radius * (cos0 * sinLat - sin0 * cosLat * cosDl);
  return { x, y, z };
};

/** Point of the tilted orbit at angle `degrees`; `front` = in front of the globe. */
const orbitPoint = (degrees: number, size: number) => {
  'worklet';
  const a = degrees * DEG;
  const ex = size * ORBIT_RX * Math.cos(a);
  const ey = size * ORBIT_RY * Math.sin(a);
  const c = size / 2;
  return {
    x: c + ex * Math.cos(ORBIT_TILT) - ey * Math.sin(ORBIT_TILT),
    y: c + ex * Math.sin(ORBIT_TILT) + ey * Math.cos(ORBIT_TILT),
    front: Math.sin(a) > 0,
  };
};

/** Half of the orbit: the back one (above, behind the globe) or the front one. */
const orbitHalf = (size: number, back: boolean) => {
  const path = Skia.PathBuilder.Make();
  for (let step = 0; step <= 64; step++) {
    const point = orbitPoint((back ? 180 : 0) + (step / 64) * 180, size);
    if (step === 0) path.moveTo(point.x, point.y);
    else path.lineTo(point.x, point.y);
  }
  return path.detach();
};

/** Turns the frame's builders into paths (plain loop: callbacks are not worklets). */
const finish = (builders: SkPathBuilder[], gridBuilder: SkPathBuilder) => {
  'worklet';
  const done: SkPath[] = [];
  for (let slot = 0; slot < builders.length; slot++) done.push(builders[slot]!.detach());
  return { paths: done, grid: gridBuilder.detach() };
};

interface LabelSpot {
  x: number;
  y: number;
  visible: boolean;
  opacity: number;
}

/**
 * Places the chips without overlapping (as on the web): the selected one first, then the
 * countries, the orbit last. Each tries its side of the point (countries above, the satellite
 * below) and then the other; when neither fits it hides until there is room.
 */
const layoutLabels = (
  xs: number[],
  ys: number[],
  shown: boolean[],
  opacities: number[],
  below: boolean[],
  sizes: number[],
  selected: number,
) => {
  'worklet';
  const spots: LabelSpot[] = [];
  const order: number[] = [];
  for (let index = 0; index < xs.length; index++) {
    spots.push({ x: 0, y: 0, visible: false, opacity: 0 });
    if (index !== selected) order.push(index);
  }
  if (selected >= 0) order.unshift(selected);
  const placed: number[] = [];
  for (let slot = 0; slot < order.length; slot++) {
    const index = order[slot]!;
    const width = sizes[index * 2] ?? 0;
    const height = sizes[index * 2 + 1] ?? 0;
    if (!shown[index] || width === 0) continue;
    let chosen = -1;
    let y1 = 0;
    for (let attempt = 0; attempt < 2 && chosen < 0; attempt++) {
      const up = below[index] ? attempt === 1 : attempt === 0;
      const top = up ? ys[index]! - LABEL_GAP - height : ys[index]! + LABEL_GAP;
      const x1 = xs[index]! - width / 2;
      let free = true;
      for (let other = 0; other < placed.length; other += 4) {
        if (!(
          x1 + width + LABEL_PAD <= placed[other]! ||
          x1 - LABEL_PAD >= placed[other + 2]! ||
          top + height + LABEL_PAD <= placed[other + 1]! ||
          top - LABEL_PAD >= placed[other + 3]!
        )) {
          free = false;
          break;
        }
      }
      if (free) {
        chosen = attempt;
        y1 = top;
      }
    }
    if (chosen < 0 && index === selected) {
      chosen = 0;
      y1 = below[index] ? ys[index]! + LABEL_GAP : ys[index]! - LABEL_GAP - height;
    }
    if (chosen < 0) continue;
    const x1 = xs[index]! - width / 2;
    placed.push(x1, y1, x1 + width, y1 + height);
    spots[index] = { x: x1, y: y1, visible: true, opacity: opacities[index]! };
  }
  return spots;
};

function DotLayer({
  frame,
  slot,
  color,
  opacity,
}: {
  frame: SharedValue<{ paths: SkPath[]; grid: SkPath }>;
  slot: number;
  color: string;
  opacity: number;
}) {
  const path = useDerivedValue(() => frame.get().paths[slot]!);
  return <Path path={path} color={color} opacity={opacity} />;
}

function MarkerView({
  marker,
  selected,
  lon0,
  lat0,
  pulse,
  size,
}: {
  marker: GlobeMarker;
  selected: boolean;
  lon0: SharedValue<number>;
  lat0: SharedValue<number>;
  pulse: SharedValue<number>;
  size: number;
}) {
  const sinLat = Math.sin(marker.lat * DEG);
  const cosLat = Math.cos(marker.lat * DEG);
  const lon = marker.lon * DEG;
  const radius = size * GLOBE_RATIO;
  const base = radius * (selected ? 0.05 : 0.04);
  const point = useDerivedValue(() => {
    const phi = lat0.get() * DEG;
    return project(
      sinLat,
      cosLat,
      lon,
      Math.sin(phi),
      Math.cos(phi),
      lon0.get() * DEG,
      radius,
      size / 2,
    );
  });
  const cx = useDerivedValue(() => point.get().x);
  const cy = useDerivedValue(() => point.get().y);
  // Hidden near the edge, like the web (only the front of the globe shows markers).
  const shown = useDerivedValue(() => (point.get().z > 0.15 ? 1 : 0));
  const ring = useDerivedValue(() => base + radius * 0.09 * pulse.get());
  const ringOpacity = useDerivedValue(() => (pulse.get() > 0 ? (1 - pulse.get()) * 0.8 : 0));
  return (
    <Group opacity={shown}>
      <Circle
        cx={cx}
        cy={cy}
        r={ring}
        color={marker.color}
        style="stroke"
        strokeWidth={Math.max(1.5, size * 0.004)}
        opacity={ringOpacity}
      />
      <Circle cx={cx} cy={cy} r={base} color={marker.color} />
      <Circle
        cx={cx}
        cy={cy}
        r={base}
        color={colors.background.DEFAULT}
        style="stroke"
        strokeWidth={Math.max(2, size * 0.006)}
      />
    </Group>
  );
}

/** Chip of a marker or of the satellite ("Brasil · 82%"), placed every frame. */
function GlobeChip({
  index,
  label,
  color,
  selected,
  spots,
  onMeasure,
  onPress,
}: {
  index: number;
  label: string;
  color: string;
  selected: boolean;
  spots: SharedValue<LabelSpot[]>;
  onMeasure: (index: number, width: number, height: number) => void;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const spot = spots.get()[index];
    const visible = spot?.visible ?? false;
    return {
      opacity: visible ? (spot?.opacity ?? 0) : 0,
      // Hidden chips leave the canvas so they cannot be pressed.
      transform: [
        { translateX: visible ? (spot?.x ?? 0) : -10_000 },
        { translateY: visible ? (spot?.y ?? 0) : 0 },
      ],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', left: 0, top: 0 }, style]}
      onLayout={(event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        onMeasure(index, width, height);
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        hitSlop={6}
        className="rounded-full border px-2.5 py-1"
        style={{
          backgroundColor: selected ? color : colors.globe.chip,
          borderColor: selected ? 'transparent' : colors.border.strong,
          shadowColor: colors.shadow,
          shadowOpacity: 0.35,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <Text size={12} weight="bold" tone={selected ? 'inverse' : 'default'} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Dotted globe the user turns by dragging, the same as the web app's: it spins slowly while
 * nobody touches it, markers pulse, the satellite of what has no country goes round the
 * orbit, and each place has a chip ("Brasil · 82%"). Tapping a marker or a chip selects it;
 * tapping elsewhere clears the selection. Drawn with Skia on the UI thread.
 */
export function InteractiveGlobe({
  markers,
  orbit,
  selectedKey,
  onSelect,
  initialCenter = { lat: 12, lon: -60 },
  autoRotate = true,
  maxSize = 300,
  accessibilityLabel,
}: InteractiveGlobeProps) {
  const [size, setSize] = useState(0);
  const radius = size * GLOBE_RATIO;
  const center = size / 2;

  /** Longitude and latitude at the center of the globe, in degrees. */
  const lon0 = useSharedValue(initialCenter.lon);
  const lat0 = useSharedValue(clamp(initialCenter.lat, -MAX_TILT, MAX_TILT));
  const velocity = useSharedValue({ lon: 0, lat: 0 });
  const dragging = useSharedValue(false);
  const focusing = useSharedValue(false);
  const clock = useSharedValue(0);
  const lastTouch = useSharedValue(-IDLE_RESUME_MS);
  const orbitAngle = useSharedValue(170);
  const pulse = useSharedValue(0);
  const paused = useSharedValue(selectedKey !== null);
  const orbitPaused = useSharedValue(orbit !== undefined && selectedKey === orbit.key);
  const motion = useSharedValue(autoRotate);
  /** Width and height of each chip, measured once they render (index × 2). */
  const [chipSizes, setChipSizes] = useState<number[]>([]);
  const measure = (index: number, width: number, height: number) =>
    setChipSizes((current) => {
      if (current[index * 2] === width && current[index * 2 + 1] === height) return current;
      const next = [...current];
      next[index * 2] = width;
      next[index * 2 + 1] = height;
      return next;
    });

  useEffect(() => {
    paused.set(selectedKey !== null);
    orbitPaused.set(orbit !== undefined && selectedKey === orbit.key);
    motion.set(autoRotate);
  }, [selectedKey, orbit, autoRotate, paused, orbitPaused, motion]);

  // Everything that moves on its own: inertia, idle spin, satellite and pulse.
  useFrame((frame) => {
    // Explicit: the Babel plugin only workletizes callbacks of hooks it knows by name.
    'worklet';
    const dt = Math.min(64, frame.timeSincePreviousFrame ?? 16) / 1000;
    clock.set(frame.timestamp);
    const moving = motion.get();
    if (!dragging.get() && !focusing.get()) {
      const v = velocity.get();
      if (Math.abs(v.lon) > 0.6 || Math.abs(v.lat) > 0.6) {
        lon0.set(lon0.get() + v.lon * dt);
        lat0.set(clamp(lat0.get() + v.lat * dt, -MAX_TILT, MAX_TILT));
        const keep = Math.pow(INERTIA, dt * 60);
        velocity.set({ lon: v.lon * keep, lat: v.lat * keep });
      } else if (moving && !paused.get() && frame.timestamp - lastTouch.get() > IDLE_RESUME_MS) {
        lon0.set(lon0.get() - AUTO_SPEED * dt);
      }
    }
    if (moving && !orbitPaused.get()) {
      orbitAngle.set((orbitAngle.get() - ORBIT_SPEED * dt + 360) % 360);
    }
    pulse.set(moving ? (frame.timestamp % PULSE_MS) / PULSE_MS : 0);
  });

  // Choosing a place (on the globe or in the list) turns the globe to it.
  const focus = markers.find((marker) => marker.key === selectedKey);
  const focusLat = focus?.lat;
  const focusLon = focus?.lon;
  useEffect(() => {
    if (focusLat === undefined || focusLon === undefined) return;
    const done = () => {
      'worklet';
      focusing.set(false);
    };
    velocity.set({ lon: 0, lat: 0 });
    lastTouch.set(clock.get());
    const goalLon = lon0.get() + shortestTurn(lon0.get(), focusLon);
    const goalLat = clamp(focusLat * 0.8, -MAX_TILT, MAX_TILT);
    if (!motion.get()) {
      focusing.set(false);
      lon0.set(goalLon);
      lat0.set(goalLat);
      return;
    }
    focusing.set(true);
    const timing = { duration: FOCUS_MS, easing: Easing.out(Easing.cubic) };
    lon0.set(withTiming(goalLon, timing, done));
    lat0.set(withTiming(goalLat, timing));
  }, [focusLat, focusLon, clock, focusing, lastTouch, lat0, lon0, motion, velocity]);

  // Highlight slot of each dot (0 = plain land).
  const highlights = markers
    .filter((marker) => marker.countryId !== undefined)
    .slice(0, MAX_HIGHLIGHTS);
  const dotSlots = DOT_COUNTRY.map(
    (id) => highlights.findIndex((marker) => marker.countryId === id) + 1,
  );
  const layerColors = [colors.globe.land, ...highlights.map((marker) => marker.color)];
  const markerGeo = markers.map((marker) => [
    Math.sin(marker.lat * DEG),
    Math.cos(marker.lat * DEG),
    marker.lon * DEG,
  ]);
  const markerKeys = markers.map((marker) => marker.key);
  const chipCount = markers.length + (orbit ? 1 : 0);
  const selectedChip =
    orbit && selectedKey === orbit.key ? markers.length : markerKeys.indexOf(selectedKey ?? '');

  const frame = useDerivedValue(() => {
    const paths: SkPathBuilder[] = [];
    for (let slot = 0; slot < (MAX_HIGHLIGHTS + 1) * BANDS; slot++)
      paths.push(Skia.PathBuilder.Make());
    const grid = Skia.PathBuilder.Make();
    if (radius <= 0) return finish(paths, grid);
    const phi = lat0.get() * DEG;
    const sin0 = Math.sin(phi);
    const cos0 = Math.cos(phi);
    const lambda = lon0.get() * DEG;
    const dot = radius * 0.0172;
    // Hot loops: the projection is inlined so no object is created per point.
    for (let index = 0; index < DOT_GEO.length; index += 3) {
      const sinLat = DOT_GEO[index]!;
      const cosLat = DOT_GEO[index + 1]!;
      const dl = DOT_GEO[index + 2]! - lambda;
      const cosDl = Math.cos(dl);
      const z = sin0 * sinLat + cos0 * cosLat * cosDl;
      if (z <= 0.02) continue;
      // Farther dots are smaller and fainter (four depth bands, as on the web).
      const band = z > 0.55 ? 3 : z > 0.3 ? 2 : z > 0.12 ? 1 : 0;
      paths[dotSlots[index / 3]! * BANDS + band]!.addCircle(
        center + radius * cosLat * Math.sin(dl),
        center - radius * (cos0 * sinLat - sin0 * cosLat * cosDl),
        dot * (0.55 + 0.45 * Math.min(1, z * 1.6)),
      );
    }
    for (const line of GRID_LINES) {
      let drawing = false;
      for (let index = 0; index < line.length; index += 3) {
        const sinLat = line[index]!;
        const cosLat = line[index + 1]!;
        const dl = line[index + 2]! - lambda;
        const cosDl = Math.cos(dl);
        if (sin0 * sinLat + cos0 * cosLat * cosDl <= 0) {
          drawing = false;
          continue;
        }
        const x = center + radius * cosLat * Math.sin(dl);
        const y = center - radius * (cos0 * sinLat - sin0 * cosLat * cosDl);
        if (drawing) grid.lineTo(x, y);
        else grid.moveTo(x, y);
        drawing = true;
      }
    }
    return finish(paths, grid);
  });
  const grid = useDerivedValue(() => frame.get().grid);

  const satellite = useDerivedValue(() => orbitPoint(orbitAngle.get(), size));
  const satelliteX = useDerivedValue(() => satellite.get().x);
  const satelliteY = useDerivedValue(() => satellite.get().y);
  const satelliteFront = useDerivedValue(() => (satellite.get().front ? 1 : 0));
  const satelliteBack = useDerivedValue(() => 1 - satelliteFront.get());

  const spots = useDerivedValue(() => {
    const phi = lat0.get() * DEG;
    const sin0 = Math.sin(phi);
    const cos0 = Math.cos(phi);
    const lambda = lon0.get() * DEG;
    const xs: number[] = [];
    const ys: number[] = [];
    const shown: boolean[] = [];
    const opacities: number[] = [];
    const below: boolean[] = [];
    for (let index = 0; index < markerGeo.length; index++) {
      const geo = markerGeo[index]!;
      const point = project(geo[0]!, geo[1]!, geo[2]!, sin0, cos0, lambda, radius, center);
      xs.push(point.x);
      ys.push(point.y);
      shown.push(point.z > 0.15);
      opacities.push(Math.min(1, (point.z - 0.15) * 4));
      below.push(false);
    }
    if (chipCount > markerGeo.length) {
      const point = satellite.get();
      xs.push(point.x);
      ys.push(point.y);
      // Behind the globe the satellite hides, and so does its chip (unless selected).
      shown.push(point.front || selectedChip === markerGeo.length);
      opacities.push(1);
      below.push(true);
    }
    return layoutLabels(xs, ys, shown, opacities, below, chipSizes, selectedChip);
  });

  const touched = () => {
    'worklet';
    cancelAnimation(lon0);
    cancelAnimation(lat0);
    focusing.set(false);
    velocity.set({ lon: 0, lat: 0 });
    lastTouch.set(clock.get());
  };

  /**
   * Turning the globe. Inside a scrolling page, one finger only takes over after a
   * horizontal move (a vertical swipe keeps scrolling the page); two fingers turn freely.
   */
  const turnGesture = (fingers: 1 | 2) => {
    const base = Gesture.Pan()
      .averageTouches(true)
      .onStart(() => {
        touched();
        dragging.set(true);
      })
      .onChange((event) => {
        // Degrees per point: the spot under the finger follows it.
        const perPoint = 180 / (Math.PI * radius);
        lon0.set(lon0.get() - event.changeX * perPoint);
        lat0.set(clamp(lat0.get() + event.changeY * perPoint, -MAX_TILT, MAX_TILT));
      })
      .onEnd((event) => {
        const perPoint = 180 / (Math.PI * radius);
        velocity.set(
          motion.get()
            ? { lon: -event.velocityX * perPoint, lat: event.velocityY * perPoint }
            : { lon: 0, lat: 0 },
        );
      })
      .onFinalize(() => {
        dragging.set(false);
        lastTouch.set(clock.get());
      });
    return fingers === 1
      ? base.maxPointers(1).activeOffsetX([-8, 8]).failOffsetY([-12, 12])
      : base.minPointers(2);
  };

  // A tap without dragging picks the closest marker, or clears the selection.
  const tap = Gesture.Tap().onEnd((event) => {
    lastTouch.set(clock.get());
    const phi = lat0.get() * DEG;
    const sin0 = Math.sin(phi);
    const cos0 = Math.cos(phi);
    const lambda = lon0.get() * DEG;
    let found: string | null = null;
    let best = size * 0.08;
    for (let index = 0; index < markerGeo.length; index++) {
      const geo = markerGeo[index]!;
      const point = project(geo[0]!, geo[1]!, geo[2]!, sin0, cos0, lambda, radius, center);
      if (point.z <= 0.15) continue;
      const distance = Math.hypot(point.x - event.x, point.y - event.y);
      if (distance < best) {
        best = distance;
        found = markerKeys[index]!;
      }
    }
    scheduleOnRN(onSelect, found);
  });

  const gesture = Gesture.Simultaneous(Gesture.Exclusive(turnGesture(2), turnGesture(1)), tap);

  const turn = (degrees: number) => {
    touched();
    lon0.set(withTiming(lon0.get() + degrees, { duration: 400 }));
  };

  const toggle = (key: string) => {
    lastTouch.set(clock.get());
    onSelect(selectedKey === key ? null : key);
  };

  const dash = [size * 0.0083, size * 0.0139];
  const orbitWidth = Math.max(1, size * 0.0042);
  const satelliteRadius = size * 0.022;
  const satelliteStroke = Math.max(2, size * 0.006);

  return (
    <View
      style={{ width: '100%', maxWidth: maxSize, aspectRatio: 1, alignSelf: 'center' }}
      onLayout={(event: LayoutChangeEvent) => setSize(Math.round(event.nativeEvent.layout.width))}
    >
      <GestureDetector gesture={gesture}>
        <View
          style={{ flex: 1 }}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Arraste para girar e toque num país para ver os ativos"
          accessibilityActions={[
            { name: 'increment', label: 'Girar para o leste' },
            { name: 'decrement', label: 'Girar para o oeste' },
          ]}
          onAccessibilityAction={(event) =>
            turn(event.nativeEvent.actionName === 'increment' ? 15 : -15)
          }
        >
          {size > 0 ? (
            <Canvas style={{ width: size, height: size }}>
              {orbit ? (
                <>
                  <Path
                    path={orbitHalf(size, true)}
                    style="stroke"
                    strokeWidth={orbitWidth}
                    color={orbit.color}
                    opacity={0.7}
                  >
                    <DashPathEffect intervals={dash} />
                  </Path>
                  <Group opacity={satelliteBack}>
                    <Circle
                      cx={satelliteX}
                      cy={satelliteY}
                      r={satelliteRadius}
                      color={orbit.color}
                    />
                    <Circle
                      cx={satelliteX}
                      cy={satelliteY}
                      r={satelliteRadius}
                      color={colors.surface.DEFAULT}
                      style="stroke"
                      strokeWidth={satelliteStroke}
                    />
                  </Group>
                </>
              ) : null}
              <Circle cx={center} cy={center} r={radius}>
                <RadialGradient
                  c={vec(center - radius * 0.3, center - radius * 0.45)}
                  r={radius * 1.25}
                  colors={[colors.globe.oceanLight, colors.globe.oceanDark]}
                />
              </Circle>
              <Path
                path={grid}
                style="stroke"
                strokeWidth={Math.max(1, size * 0.0028)}
                color={colors.border.DEFAULT}
              />
              {layerColors.map((color, layer) =>
                BAND_OPACITY.map((opacity, band) => (
                  <DotLayer
                    key={`${layer}-${band}`}
                    frame={frame}
                    slot={layer * BANDS + band}
                    color={color}
                    opacity={opacity}
                  />
                )),
              )}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                style="stroke"
                strokeWidth={1}
                color={colors.border.strong}
              />
              {markers.map((marker) => (
                <MarkerView
                  key={marker.key}
                  marker={marker}
                  selected={marker.key === selectedKey}
                  lon0={lon0}
                  lat0={lat0}
                  pulse={pulse}
                  size={size}
                />
              ))}
              {orbit ? (
                <>
                  <Path
                    path={orbitHalf(size, false)}
                    style="stroke"
                    strokeWidth={orbitWidth}
                    color={orbit.color}
                    opacity={0.7}
                  >
                    <DashPathEffect intervals={dash} />
                  </Path>
                  <Group opacity={satelliteFront}>
                    <Circle
                      cx={satelliteX}
                      cy={satelliteY}
                      r={satelliteRadius}
                      color={orbit.color}
                    />
                    <Circle
                      cx={satelliteX}
                      cy={satelliteY}
                      r={satelliteRadius}
                      color={colors.surface.DEFAULT}
                      style="stroke"
                      strokeWidth={satelliteStroke}
                    />
                  </Group>
                </>
              ) : null}
            </Canvas>
          ) : null}
        </View>
      </GestureDetector>
      {size > 0 ? (
        <>
          {markers.map((marker, index) => (
            <GlobeChip
              key={marker.key}
              index={index}
              label={marker.label}
              color={marker.color}
              selected={marker.key === selectedKey}
              spots={spots}
              onMeasure={measure}
              onPress={() => toggle(marker.key)}
            />
          ))}
          {orbit ? (
            <GlobeChip
              index={markers.length}
              label={orbit.label}
              color={orbit.color}
              selected={orbit.key === selectedKey}
              spots={spots}
              onMeasure={measure}
              onPress={() => toggle(orbit.key)}
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
}
