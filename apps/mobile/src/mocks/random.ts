/**
 * Small seeded PRNG (mulberry32) so fake data is identical on every run, in tests and in
 * the app. No dependency, no Math.random.
 */
import { cents } from '@guara/utils';
import type { Cents } from '@guara/types';

export interface Random {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max]. */
  int(min: number, max: number): number;
  /** Amount in cents between two values in reais, rounded to 10 centavos. */
  amount(minReais: number, maxReais: number): Cents;
  pick<T>(items: readonly T[]): T;
  chance(probability: number): boolean;
}

export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    amount: (minReais, maxReais) => cents(int(minReais * 10, maxReais * 10) * 10),
    pick: (items) => {
      if (items.length === 0) throw new Error('Cannot pick from an empty list');
      return items[int(0, items.length - 1)]!;
    },
    chance: (probability) => next() < probability,
  };
}

/** Stable numeric seed from a string (FNV-1a), e.g. per ticker. */
export function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
