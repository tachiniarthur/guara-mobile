/**
 * Generates apps/mobile/src/components/charts/globe/land-dots.ts (land of the world as dots).
 * Run from an empty folder with the geo tools installed:
 *   npm i world-atlas@2 topojson-client@3 d3-geo@3 && node /path/to/generate-land-dots.mjs
 * then copy the generated land-dots.ts over the app's file.
 */
import fs from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains, geoBounds, geoCentroid } from 'd3-geo';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const countries = feature(topo, topo.objects.countries).features.filter((f) => f.geometry);
const boxes = countries.map((f) => geoBounds(f));

const STEP = 2.4; // degrees between dots (≈ the design's dot spacing)
const dots = [];
for (let lat = -84 + STEP / 2; lat < 84; lat += STEP) {
  const lonStep = STEP / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  for (let lon = -180 + lonStep / 2; lon < 180; lon += lonStep) {
    let id = null;
    for (let i = 0; i < countries.length; i++) {
      const [[w, s], [e, n]] = boxes[i];
      const inLon = w <= e ? lon >= w && lon <= e : lon >= w || lon <= e;
      if (!inLon || lat < s || lat > n) continue;
      if (geoContains(countries[i], [lon, lat])) {
        id = countries[i].id ?? '0';
        break;
      }
    }
    if (id !== null)
      dots.push([Math.round(lat * 10) / 10, Math.round(lon * 10) / 10, Number(id) || 0]);
  }
}
const centroids = {};
for (const f of countries) {
  if (!f.id) continue;
  const [lon, lat] = geoCentroid(f);
  centroids[Number(f.id)] = [Math.round(lat * 10) / 10, Math.round(lon * 10) / 10];
}
const flat = dots.flat();
const out = `/**
 * Land of the world as dots (lat, lon, ISO 3166-1 numeric country), every ${STEP}° — the
 * halftone style of the design's globe. Generated from Natural Earth 1:50m (public domain,
 * via world-atlas); regenerate instead of editing by hand.
 */
export const LAND_DOTS: readonly number[] = [${flat.join(',')}];

/** Visual center of each country (lat, lon) by ISO 3166-1 numeric code. */
export const COUNTRY_CENTERS: Readonly<Record<number, readonly [number, number]>> = ${JSON.stringify(centroids)};
`;
fs.writeFileSync('land-dots.ts', out);
// eslint-disable-next-line no-console -- CLI script: reports what it generated.
console.log('dots', dots.length, 'bytes', out.length, 'BR', centroids[76], 'US', centroids[840]);
