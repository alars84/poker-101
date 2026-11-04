import { shuffled, type Rng } from '../domain/deck'
import { HAND_CATEGORIES, type HandCategory } from '../domain/hand'

export const STRONGEST_FIRST: readonly HandCategory[] = [...HAND_CATEGORIES].reverse()

export function shuffledHands(rng: Rng = Math.random): HandCategory[] {
  const order = shuffled(STRONGEST_FIRST, rng)
  // A solved list would leave nothing to do, so nudge it out of order.
  if (countInRightSpot(order) === order.length) [order[0], order[1]] = [order[1], order[0]]
  return order
}

/** Slides the hand at `from` to `to`. A `to` past either end stops at that end. */
export function moveHand(order: readonly HandCategory[], from: number, to: number): HandCategory[] {
  const result = [...order]
  const [hand] = result.splice(from, 1)
  result.splice(Math.min(Math.max(to, 0), order.length - 1), 0, hand)
  return result
}

export function isInRightSpot(order: readonly HandCategory[], spot: number): boolean {
  return order[spot] === STRONGEST_FIRST[spot]
}

export function countInRightSpot(order: readonly HandCategory[]): number {
  return order.filter((_, spot) => isInRightSpot(order, spot)).length
}
