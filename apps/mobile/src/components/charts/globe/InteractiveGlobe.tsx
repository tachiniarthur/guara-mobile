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
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { LAND_DOTS } from './land-dots';

export interface GlobeMarker {
  key: string;
  /** Spoken name ("Brasil"). */
  label: string;
  lat: number;
  lon: number;
  color: string;
  /** ISO 3166-1 numeric code: the country's dots take the marker color and are tappable. */
  countryId?: number;
}

/** Something without a country (Bitcoin): a satellite on the dashed orbit around the globe. */
export interface GlobeOrbit {
  key: string;
  label: string;
  color: string;
}

export interface InteractiveGlobeProps {
  markers: readonly GlobeMarker[];
  orbit?: GlobeOrbit;
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
  /** Where the globe starts (and returns on double tap). */
  initialCenter: { lat: number; lon: number };
  /** Spin slowly while nobody touches it (off with reduced motion). */
  autoRotate?: boolean;
  /** Largest side in dp (default 300). */
  maxSize?: number;
  accessibilityLabel: string;
}

const DEG = Math.PI / 180;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.6;
const MAX_LAT = 80;
/** The globe takes 80% of the canvas, as in the design (radius 120 of 300). */
const RADIUS_RATIO = 0.4;
/** Dot radius at the center of the globe, relative to the radius (design: 2.5 of 120). */
const DOT_RATIO = 0.0208;
/** Highlight colors drawn on top of the land (one path each). */
const MAX_HIGHLIGHTS = 4;

/** Per dot: sin(lat), cos(lat), lon in radians — computed once for every frame. */
const DOT_GEO: number[] = [];
const DOT_COUNTRY: number[] = [];
for (let index = 0; index < LAND_DOTS.length; index += 3) {
  const lat = (LAND_DOTS[index] ?? 0) * DEG;
  DOT_GEO.push(Math.sin(lat), Math.cos(lat), (LAND_DOTS[index + 1] ?? 0) * DEG);
  DOT_COUNTRY.push(LAND_DOTS[index + 2] ?? 0);
}

/** Meridians every 30° and parallels every 30°, sampled every 6° (sin lat, cos lat, lon). */
const GRID_LINES: number[][] = [];
for (let lon = -180; lon < 180; lon += 30) {
  const line: number[] = [];
  for (let lat = -84; lat <= 84; lat += 6)
    line.push(Math.sin(lat * DEG), Math.cos(lat * DEG), lon * DEG);
  GRID_LINES.push(line);
}
for (let lat = -60; lat <= 60; lat += 30) {
  const line: number[] = [];
  for (let lon = -180; lon <= 180; lon += 6)
    line.push(Math.sin(lat * DEG), Math.cos(lat * DEG), lon * DEG);
  GRID_LINES.push(line);
}

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(max, Math.max(min, value));
};

/** Shortest turn from `from` to `to`, in degrees (-180…180]. */
const shortestTurn = (from: number, to: number) => {
  'worklet';
  const delta = ((((to - from) % 360) + 540) % 360) - 180;
  return delta;
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

/** Turns the frame's builders into paths (plain loop: callbacks are not worklets). */
const finish = (builders: SkPathBuilder[], gridBuilder: SkPathBuilder) => {
  'worklet';
  const done: SkPath[] = [];
  for (let slot = 0; slot < builders.length; slot++) done.push(builders[slot]!.detach());
  return { paths: done, grid: gridBuilder.detach() };
};

/** Point of the tilted orbit (an ellipse turned -18°, as in the design) at angle `t`. */
const orbitPoint = (t: number, radius: number, center: number) => {
  'worklet';
  const rx = radius * 1.18;
  const ry = radius * 0.36;
  const ex = rx * Math.cos(t);
  const ey = ry * Math.sin(t);
  const angle = -18 * DEG;
  return {
    x: center + ex * Math.cos(angle) - ey * Math.sin(angle),
    y: center + ex * Math.sin(angle) + ey * Math.cos(angle),
  };
};

function MarkerView({
  marker,
  selected,
  lon0,
  lat0,
  zoom,
  radius,
  center,
}: {
  marker: GlobeMarker;
  selected: boolean;
  lon0: SharedValue<number>;
  lat0: SharedValue<number>;
  zoom: SharedValue<number>;
  radius: number;
  center: number;
}) {
  const sinLat = Math.sin(marker.lat * DEG);
  const cosLat = Math.cos(marker.lat * DEG);
  const lon = marker.lon * DEG;
  const point = useDerivedValue(() => {
    const phi = lat0.get() * DEG;
    return project(
      sinLat,
      cosLat,
      lon,
      Math.sin(phi),
      Math.cos(phi),
      lon0.get() * DEG,
      radius * zoom.get(),
      center,
    );
  });
  const cx = useDerivedValue(() => point.get().x);
  const cy = useDerivedValue(() => point.get().y);
  const opacity = useDerivedValue(() => clamp(point.get().z * 6, 0, 1));
  const halo = useDerivedValue(() => (selected ? 15 : 11) * Math.min(1.4, Math.sqrt(zoom.get())));
  return (
    <Group opacity={opacity}>
      <Circle cx={cx} cy={cy} r={halo} color={marker.color} opacity={selected ? 0.35 : 0.22} />
      {selected ? (
        <Circle cx={cx} cy={cy} r={halo} color={marker.color} style="stroke" strokeWidth={1.5} />
      ) : null}
      <Circle cx={cx} cy={cy} r={6} color={marker.color} />
      <Circle cx={cx} cy={cy} r={6} color={colors.surface.DEFAULT} style="stroke" strokeWidth={2} />
    </Group>
  );
}

/**
 * Halftone globe the user turns (drag, with inertia) and zooms (pinch). Countries with
 * investments take their color and a marker; tapping one selects it. Everything is drawn
 * with Skia from Reanimated values on the UI thread, so turning never waits for JavaScript.
 */
export function InteractiveGlobe({
  markers,
  orbit,
  selectedKey,
  onSelect,
  initialCenter,
  autoRotate = true,
  maxSize = 300,
  accessibilityLabel,
}: InteractiveGlobeProps) {
  const [size, setSize] = useState(0);
  const radius = size * RADIUS_RATIO;
  const center = size / 2;

  const rotLon = useSharedValue(initialCenter.lon);
  const rotLat = useSharedValue(initialCenter.lat);
  /** Extra longitude of the idle spin (kept apart so a touch can stop it cleanly). */
  const spin = useSharedValue(0);
  const zoom = useSharedValue(1);
  const pinchStart = useSharedValue(1);
  const orbitAngle = useSharedValue(Math.PI * 0.9);
  const lon0 = useDerivedValue(() => rotLon.get() + spin.get());

  // Highlight slot of each dot (0 = plain land).
  const highlights = markers
    .filter((marker) => marker.countryId !== undefined)
    .slice(0, MAX_HIGHLIGHTS);
  const dotSlots = DOT_COUNTRY.map((id) => {
    const index = highlights.findIndex((marker) => marker.countryId === id);
    return index + 1;
  });
  const slotKeys = highlights.map((marker) => marker.key);
  const markerGeo = markers.map((marker) => [
    Math.sin(marker.lat * DEG),
    Math.cos(marker.lat * DEG),
    marker.lon * DEG,
  ]);
  const markerKeys = markers.map((marker) => marker.key);
  const orbitKey = orbit?.key ?? null;

  // Idle spin: one turn every two minutes.
  useEffect(() => {
    if (!autoRotate || selectedKey !== null) return;
    spin.set(
      withRepeat(
        withTiming(spin.get() + 360, { duration: 120_000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(spin);
  }, [autoRotate, selectedKey, spin]);

  // The orbit's satellite keeps going round (it is the only thing that moves without a touch).
  useEffect(() => {
    if (!orbit || !autoRotate) return;
    orbitAngle.set(
      withRepeat(
        withTiming(orbitAngle.get() + Math.PI * 2, { duration: 24_000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(orbitAngle);
  }, [orbit, autoRotate, orbitAngle]);

  // Selecting a country brings it to the front.
  const focus = markers.find((marker) => marker.key === selectedKey);
  const focusLat = focus?.lat;
  const focusLon = focus?.lon;
  useEffect(() => {
    if (focusLat === undefined || focusLon === undefined) return;
    cancelAnimation(spin);
    const current = rotLon.get() + spin.get();
    spin.set(0);
    rotLon.set(current);
    rotLon.set(withTiming(current + shortestTurn(current, focusLon), { duration: 700 }));
    rotLat.set(withTiming(clamp(focusLat, -MAX_LAT, MAX_LAT), { duration: 700 }));
  }, [focusLat, focusLon, rotLat, rotLon, spin]);

  const frame = useDerivedValue(() => {
    const paths: SkPathBuilder[] = [];
    for (let slot = 0; slot <= MAX_HIGHLIGHTS; slot++) paths.push(Skia.PathBuilder.Make());
    const grid = Skia.PathBuilder.Make();
    if (radius <= 0) return finish(paths, grid);
    const phi = rotLat.get() * DEG;
    const sin0 = Math.sin(phi);
    const cos0 = Math.cos(phi);
    const lambda = lon0.get() * DEG;
    const r = radius * zoom.get();
    const dot = radius * DOT_RATIO * zoom.get();
    // Hot loops: the projection is inlined so no object is created per point.
    for (let index = 0; index < DOT_GEO.length; index += 3) {
      const sinLat = DOT_GEO[index]!;
      const cosLat = DOT_GEO[index + 1]!;
      const dl = DOT_GEO[index + 2]! - lambda;
      const cosDl = Math.cos(dl);
      const z = sin0 * sinLat + cos0 * cosLat * cosDl;
      if (z <= 0.03) continue;
      paths[dotSlots[index / 3]!]!.addCircle(
        center + r * cosLat * Math.sin(dl),
        center - r * (cos0 * sinLat - sin0 * cosLat * cosDl),
        dot * (0.45 + 0.55 * z),
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
        const x = center + r * cosLat * Math.sin(dl);
        const y = center - r * (cos0 * sinLat - sin0 * cosLat * cosDl);
        if (drawing) grid.lineTo(x, y);
        else grid.moveTo(x, y);
        drawing = true;
      }
    }
    return finish(paths, grid);
  });

  const land = useDerivedValue(() => frame.get().paths[0]!);
  const slot1 = useDerivedValue(() => frame.get().paths[1]!);
  const slot2 = useDerivedValue(() => frame.get().paths[2]!);
  const slot3 = useDerivedValue(() => frame.get().paths[3]!);
  const slot4 = useDerivedValue(() => frame.get().paths[4]!);
  const grid = useDerivedValue(() => frame.get().grid);
  const slotPaths = [slot1, slot2, slot3, slot4];

  const globeRadius = useDerivedValue(() => radius * zoom.get());
  const orbitPath = useDerivedValue(() => {
    const path = Skia.PathBuilder.Make();
    const r = radius * zoom.get();
    for (let step = 0; step <= 96; step++) {
      const point = orbitPoint((step / 96) * Math.PI * 2, r, center);
      if (step === 0) path.moveTo(point.x, point.y);
      else path.lineTo(point.x, point.y);
    }
    return path.detach();
  });
  /** Front half of the orbit (drawn over the globe). */
  const orbitFront = useDerivedValue(() => {
    const path = Skia.PathBuilder.Make();
    const r = radius * zoom.get();
    for (let step = 0; step <= 48; step++) {
      const point = orbitPoint((step / 48) * Math.PI, r, center);
      if (step === 0) path.moveTo(point.x, point.y);
      else path.lineTo(point.x, point.y);
    }
    return path.detach();
  });
  const satellite = useDerivedValue(() =>
    orbitPoint(orbitAngle.get(), radius * zoom.get(), center),
  );
  const satelliteX = useDerivedValue(() => satellite.get().x);
  const satelliteY = useDerivedValue(() => satellite.get().y);
  /** Behind the globe on the upper half of the orbit. */
  const satelliteFront = useDerivedValue(() => (Math.sin(orbitAngle.get()) >= 0 ? 1 : 0));
  const satelliteBack = useDerivedValue(() => 1 - satelliteFront.get());

  const stopMotion = () => {
    'worklet';
    cancelAnimation(spin);
    cancelAnimation(rotLon);
    cancelAnimation(rotLat);
    rotLon.set(rotLon.get() + spin.get());
    spin.set(0);
  };

  /**
   * Turning the globe. Inside a scrolling page, one finger only takes over after a
   * horizontal move (a vertical swipe keeps scrolling the page); two fingers turn freely.
   */
  const turnGesture = (fingers: 1 | 2) => {
    const base = Gesture.Pan()
      .averageTouches(true)
      .onStart(() => {
        stopMotion();
      })
      .onChange((event) => {
        const perPoint = 1 / (radius * zoom.get() * DEG);
        rotLon.set(rotLon.get() - event.changeX * perPoint);
        rotLat.set(clamp(rotLat.get() + event.changeY * perPoint, -MAX_LAT, MAX_LAT));
      })
      .onEnd((event) => {
        const perPoint = 1 / (radius * zoom.get() * DEG);
        rotLon.set(withDecay({ velocity: -event.velocityX * perPoint, deceleration: 0.996 }));
        rotLat.set(
          withDecay({
            velocity: event.velocityY * perPoint,
            deceleration: 0.996,
            clamp: [-MAX_LAT, MAX_LAT],
          }),
        );
      });
    return fingers === 1
      ? base.maxPointers(1).activeOffsetX([-8, 8]).failOffsetY([-12, 12])
      : base.minPointers(2);
  };
  const pan = Gesture.Exclusive(turnGesture(2), turnGesture(1));

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      pinchStart.set(zoom.get());
    })
    .onUpdate((event) => {
      zoom.set(clamp(pinchStart.get() * event.scale, MIN_ZOOM, MAX_ZOOM));
    });

  const reset = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      stopMotion();
      zoom.set(withTiming(1, { duration: 400 }));
      rotLon.set(
        withTiming(rotLon.get() + shortestTurn(rotLon.get(), initialCenter.lon), { duration: 600 }),
      );
      rotLat.set(withTiming(initialCenter.lat, { duration: 600 }));
      scheduleOnRN(onSelect, null);
    });

  const tap = Gesture.Tap().onEnd((event) => {
    const phi = rotLat.get() * DEG;
    const sin0 = Math.sin(phi);
    const cos0 = Math.cos(phi);
    const lambda = lon0.get() * DEG;
    const r = radius * zoom.get();
    let found: string | null = null;
    let best = 26 * 26;
    // Markers first, then the satellite, then any dot of a highlighted country.
    for (let index = 0; index < markerGeo.length; index++) {
      const geo = markerGeo[index]!;
      const point = project(geo[0]!, geo[1]!, geo[2]!, sin0, cos0, lambda, r, center);
      const distance = (point.x - event.x) ** 2 + (point.y - event.y) ** 2;
      if (point.z > 0 && distance < best) {
        best = distance;
        found = markerKeys[index]!;
      }
    }
    if (found === null && orbitKey !== null) {
      const point = orbitPoint(orbitAngle.get(), r, center);
      if ((point.x - event.x) ** 2 + (point.y - event.y) ** 2 < 30 * 30) found = orbitKey;
    }
    if (found === null) {
      const reach = (radius * DOT_RATIO * zoom.get() * 3) ** 2;
      for (let index = 0; index < DOT_GEO.length; index += 3) {
        const slot = dotSlots[index / 3]!;
        if (slot === 0) continue;
        const point = project(
          DOT_GEO[index]!,
          DOT_GEO[index + 1]!,
          DOT_GEO[index + 2]!,
          sin0,
          cos0,
          lambda,
          r,
          center,
        );
        if (point.z > 0 && (point.x - event.x) ** 2 + (point.y - event.y) ** 2 < reach) {
          found = slotKeys[slot - 1]!;
          break;
        }
      }
    }
    scheduleOnRN(onSelect, found);
  });

  const gesture = Gesture.Simultaneous(pan, pinch, Gesture.Exclusive(reset, tap));

  const turn = (degrees: number) => {
    cancelAnimation(spin);
    rotLon.set(withTiming(rotLon.get() + spin.get() + degrees, { duration: 400 }));
    spin.set(0);
  };

  return (
    <View
      style={{ width: '100%', maxWidth: maxSize, aspectRatio: 1, alignSelf: 'center' }}
      onLayout={(event: LayoutChangeEvent) => setSize(Math.round(event.nativeEvent.layout.width))}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Arraste para os lados ou use dois dedos para girar, pinça para aproximar e toque num país para ver os ativos"
      accessibilityActions={[
        { name: 'increment', label: 'Girar para o leste' },
        { name: 'decrement', label: 'Girar para o oeste' },
      ]}
      onAccessibilityAction={(event) =>
        turn(event.nativeEvent.actionName === 'increment' ? 40 : -40)
      }
    >
      {size > 0 ? (
        <GestureDetector gesture={gesture}>
          <Canvas style={{ width: size, height: size }}>
            {orbit ? (
              <>
                <Path
                  path={orbitPath}
                  style="stroke"
                  strokeWidth={1.5}
                  color={orbit.color}
                  opacity={0.7}
                >
                  <DashPathEffect intervals={[3, 5]} />
                </Path>
                <Group opacity={satelliteBack}>
                  <Circle
                    cx={satelliteX}
                    cy={satelliteY}
                    r={6.6}
                    color={orbit.color}
                    opacity={0.5}
                  />
                </Group>
              </>
            ) : null}
            <Circle cx={center} cy={center} r={globeRadius}>
              <RadialGradient
                c={vec(center - radius * 0.29, center - radius * 0.43)}
                r={radius * 2.1}
                colors={[colors.globe.oceanLight, colors.globe.oceanDark]}
              />
            </Circle>
            <Path path={grid} style="stroke" strokeWidth={1} color={colors.border.DEFAULT} />
            <Path path={land} color={colors.globe.land} />
            {highlights.map((marker, index) => (
              <Path key={marker.key} path={slotPaths[index]!} color={marker.color} />
            ))}
            <Circle
              cx={center}
              cy={center}
              r={globeRadius}
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
                lat0={rotLat}
                zoom={zoom}
                radius={radius}
                center={center}
              />
            ))}
            {orbit ? (
              <>
                <Path path={orbitFront} style="stroke" strokeWidth={1.5} color={orbit.color}>
                  <DashPathEffect intervals={[3, 5]} />
                </Path>
                <Group opacity={satelliteFront}>
                  {orbit.key === selectedKey ? (
                    <Circle
                      cx={satelliteX}
                      cy={satelliteY}
                      r={13}
                      color={orbit.color}
                      opacity={0.3}
                    />
                  ) : null}
                  <Circle cx={satelliteX} cy={satelliteY} r={6.6} color={orbit.color} />
                  <Circle
                    cx={satelliteX}
                    cy={satelliteY}
                    r={6.6}
                    color={colors.surface.DEFAULT}
                    style="stroke"
                    strokeWidth={2}
                  />
                </Group>
              </>
            ) : null}
          </Canvas>
        </GestureDetector>
      ) : null}
    </View>
  );
}
