import { rankLabel, type Card, type Rank } from './card'

/** One of the 169 hand classes, which treat all suits as equal. */
export type StartingHand = {
  readonly high: Rank
  readonly low: Rank
  readonly suited: boolean
  /** Poker shorthand like 77, AKs, or AKo. */
  readonly label: string
}

export type StartingHandShape = 'pair' | 'suited ace' | 'big cards' | 'suited connector' | 'weak'

const ACE: Rank = 14
const TEN: Rank = 10
// One-gappers like 9-7 still make plenty of straights.
const MAX_CONNECTOR_GAP = 2

export function startingHandOf(holeCards: readonly Card[]): StartingHand {
  if (holeCards.length !== 2) throw new Error(`A starting hand is two cards, not ${holeCards.length}`)
  const [first, second] = holeCards
  const high = first.rank >= second.rank ? first.rank : second.rank
  const low = first.rank >= second.rank ? second.rank : first.rank
  const suited = first.suit === second.suit
  const ranks = `${rankCode(high)}${rankCode(low)}`
  return { high, low, suited, label: high === low ? ranks : `${ranks}${suited ? 's' : 'o'}` }
}

export function startingHandShape({ high, low, suited }: StartingHand): StartingHandShape {
  if (high === low) return 'pair'
  if (low >= TEN) return 'big cards'
  if (suited && high === ACE) return 'suited ace'
  if (suited && high - low <= MAX_CONNECTOR_GAP) return 'suited connector'
  return 'weak'
}

function rankCode(rank: Rank): string {
  return rank === TEN ? 'T' : rankLabel(rank)
}
