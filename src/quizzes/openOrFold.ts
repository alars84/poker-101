import type { Card } from '../domain/card'
import { Deck, type Rng } from '../domain/deck'
import { earliestOpeningSeat, SEATS, shouldOpen, type Seat } from '../domain/openingChart'
import { startingHandOf, type StartingHand } from '../domain/startingHand'
import { capitalize } from './capitalize'

export type OpeningDecision = 'raise' | 'fold'

export type OpenOrFoldRound = {
  readonly seat: Seat
  readonly holeCards: readonly Card[]
  readonly decision: OpeningDecision
}

// Far more than the rarest target needs: early-seat raises turn up about 1 deal in 13.
const MAX_DEALS = 500

/**
 * Aims for even raises and folds, because plain deals are mostly folds. Half
 * the folds are close calls: hands a later seat would open.
 */
export function dealOpenOrFoldRound(rng: Rng = Math.random): OpenOrFoldRound {
  const seat = SEATS[Math.floor(rng() * SEATS.length)]
  const fits = pickTarget(seat, rng)
  let holeCards = new Deck(rng).deal(2)
  for (let i = 1; i < MAX_DEALS && !fits(startingHandOf(holeCards)); i++) {
    holeCards = new Deck(rng).deal(2)
  }
  return { seat, holeCards, decision: shouldOpen(startingHandOf(holeCards), seat) ? 'raise' : 'fold' }
}

export function isCorrectDecision(round: OpenOrFoldRound, decision: OpeningDecision): boolean {
  return round.decision === decision
}

export function openOrFoldTopic(seat: Seat): string {
  return `${capitalize(seat)} position`
}

function pickTarget(seat: Seat, rng: Rng): (hand: StartingHand) => boolean {
  if (rng() < 0.5) return (hand) => shouldOpen(hand, seat)
  const wantsCloseCall = rng() < 0.5
  return (hand) => {
    if (shouldOpen(hand, seat)) return false
    // The late seat is the last to open, so it has no close calls to aim for.
    return !wantsCloseCall || seat === 'late' || earliestOpeningSeat(hand) !== null
  }
}
