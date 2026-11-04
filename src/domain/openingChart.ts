import type { StartingHand } from './startingHand'

export const SEATS = ['early', 'middle', 'late'] as const
export type Seat = (typeof SEATS)[number]

/**
 * The hands each seat adds to the seat before it, for raising first in at a
 * nine-handed table with no antes. Deliberately simple: a beginner's chart,
 * not a solver's.
 */
const HANDS_ADDED_BY_SEAT: Record<Seat, readonly string[]> = {
  early: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77',
    'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs',
    'AKo', 'AQo',
  ],
  middle: [
    '66', '55',
    'A9s', 'KTs', 'QTs', 'JTs', 'T9s',
    'AJo', 'KQo',
  ],
  late: [
    '44', '33', '22',
    'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'K9s', 'K8s', 'Q9s', 'J9s', 'T8s', '98s', '87s', '76s', '65s',
    'ATo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo',
  ],
}

/** Null when no seat opens the hand. */
export function earliestOpeningSeat(hand: StartingHand): Seat | null {
  return SEATS.find((seat) => HANDS_ADDED_BY_SEAT[seat].includes(hand.label)) ?? null
}

export function shouldOpen(hand: StartingHand, seat: Seat): boolean {
  const earliest = earliestOpeningSeat(hand)
  return earliest !== null && SEATS.indexOf(earliest) <= SEATS.indexOf(seat)
}
