import { allCards, type Card } from './card'

/** Returns a number in [0, 1). Math.random fits; tests pass a seeded one. */
export type Rng = () => number

/** Fisher-Yates, so every ordering is equally likely. */
export function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export class Deck {
  #cards: Card[]

  constructor(rng: Rng = Math.random) {
    this.#cards = shuffled(allCards(), rng)
  }

  get remaining(): number {
    return this.#cards.length
  }

  deal(count: number): Card[] {
    if (count > this.#cards.length) {
      throw new Error(`Cannot deal ${count} cards, only ${this.#cards.length} remain`)
    }
    return this.#cards.splice(0, count)
  }
}
