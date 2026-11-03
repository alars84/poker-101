import type { Rng } from '../domain/deck'

/** A small seeded generator so tests can replay the same shuffles. */
export function seededRng(seed: number): Rng {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}
