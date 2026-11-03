import type { Card } from '../domain/card'
import { Deck, type Rng } from '../domain/deck'
import { evaluateBestHand, HAND_CATEGORIES, type Hand, type HandCategory } from '../domain/hand'

export type NameTheHandRound = {
  readonly board: readonly Card[]
  readonly holeCards: readonly Card[]
  readonly hand: Hand
}

// Enough to find anything down to four of a kind. Rarer hands stay rare.
const MAX_DEALS = 2000

/** Aims for a random category, because plain deals are mostly pairs and high cards. */
export function dealNameTheHandRound(rng: Rng = Math.random): NameTheHandRound {
  const target = HAND_CATEGORIES[Math.floor(rng() * HAND_CATEGORIES.length)]
  let round = dealRound(rng)
  for (let i = 1; i < MAX_DEALS && round.hand.category !== target; i++) {
    round = dealRound(rng)
  }
  return round
}

export function isCorrectName(round: NameTheHandRound, category: HandCategory): boolean {
  return round.hand.category === category
}

function dealRound(rng: Rng): NameTheHandRound {
  const deck = new Deck(rng)
  const holeCards = deck.deal(2)
  const board = deck.deal(5)
  return { board, holeCards, hand: evaluateBestHand([...board, ...holeCards]) }
}
