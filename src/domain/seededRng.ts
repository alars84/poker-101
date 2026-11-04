import type { Rng } from './deck'

/** A small seeded generator, so a shuffle can be replayed: same seed, same cards. */
export function seededRng(seed: number): Rng {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}
