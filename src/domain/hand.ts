import type { Card, Rank } from './card'

// Ordered weakest to strongest, so the index is the category's strength.
export const HAND_CATEGORIES = [
  'high card',
  'pair',
  'two pair',
  'three of a kind',
  'straight',
  'flush',
  'full house',
  'four of a kind',
  'straight flush',
  'royal flush',
] as const
export type HandCategory = (typeof HAND_CATEGORIES)[number]

export type Hand = {
  readonly category: HandCategory
  /** Ranks compared in order to split two hands of the same category. */
  readonly tiebreakers: readonly Rank[]
  readonly cards: readonly Card[]
}

const WHEEL_HIGH_CARD: Rank = 5
const ACE: Rank = 14

/**
 * Finds the best five-card hand. Earlier cards win when two combinations are
 * equal, so a caller listing the board first gets the board's cards back.
 */
export function evaluateBestHand(cards: readonly Card[]): Hand {
  const [first, ...rest] = fiveCardCombinations(cards).map(evaluateFive)
  return rest.reduce((best, hand) => (compareHands(hand, best) > 0 ? hand : best), first)
}

/** Positive when a beats b, negative when b beats a, zero for a tie. */
export function compareHands(a: Hand, b: Hand): number {
  const byCategory = HAND_CATEGORIES.indexOf(a.category) - HAND_CATEGORIES.indexOf(b.category)
  if (byCategory !== 0) return byCategory
  for (let i = 0; i < a.tiebreakers.length; i++) {
    if (a.tiebreakers[i] !== b.tiebreakers[i]) return a.tiebreakers[i] - b.tiebreakers[i]
  }
  return 0
}

export function isStraightOrBetter(hand: Hand): boolean {
  return HAND_CATEGORIES.indexOf(hand.category) >= HAND_CATEGORIES.indexOf('straight')
}

function fiveCardCombinations(cards: readonly Card[]): Card[][] {
  const combinations: Card[][] = []
  const choose = (start: number, chosen: Card[]) => {
    if (chosen.length === 5) {
      combinations.push(chosen)
      return
    }
    for (let i = start; i < cards.length; i++) choose(i + 1, [...chosen, cards[i]])
  }
  choose(0, [])
  return combinations
}

function evaluateFive(cards: Card[]): Hand {
  const groups = rankGroups(cards)
  const groupRanks = groups.map((group) => group.rank)
  const counts = groups.map((group) => group.count).join('')
  const isFlush = cards.every((card) => card.suit === cards[0].suit)
  const straightHigh = straightHighCard(cards)

  if (isFlush && straightHigh === ACE) return { category: 'royal flush', tiebreakers: [], cards }
  if (isFlush && straightHigh) return { category: 'straight flush', tiebreakers: [straightHigh], cards }
  if (counts === '41') return { category: 'four of a kind', tiebreakers: groupRanks, cards }
  if (counts === '32') return { category: 'full house', tiebreakers: groupRanks, cards }
  if (isFlush) return { category: 'flush', tiebreakers: groupRanks, cards }
  if (straightHigh) return { category: 'straight', tiebreakers: [straightHigh], cards }
  if (counts === '311') return { category: 'three of a kind', tiebreakers: groupRanks, cards }
  if (counts === '221') return { category: 'two pair', tiebreakers: groupRanks, cards }
  if (counts === '2111') return { category: 'pair', tiebreakers: groupRanks, cards }
  return { category: 'high card', tiebreakers: groupRanks, cards }
}

/** Groups by rank with the biggest group first, then the highest rank. */
function rankGroups(cards: Card[]): { rank: Rank; count: number }[] {
  const counts = new Map<Rank, number>()
  for (const { rank } of cards) counts.set(rank, (counts.get(rank) ?? 0) + 1)
  return [...counts]
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank)
}

function straightHighCard(cards: Card[]): Rank | null {
  const ranks = cards.map((card) => card.rank).sort((a, b) => b - a)
  if (new Set(ranks).size !== 5) return null
  if (ranks[0] - ranks[4] === 4) return ranks[0]
  const isWheel = ranks.join() === '14,5,4,3,2'
  return isWheel ? WHEEL_HIGH_CARD : null
}

/** How many leading tiebreakers are the made hand. Anything after is a kicker. */
const MADE_RANKS: Partial<Record<HandCategory, number>> = {
  'high card': 1,
  pair: 1,
  'two pair': 2,
  'three of a kind': 1,
  'four of a kind': 1,
}

export function hasKickers(hand: Hand): boolean {
  return hand.category in MADE_RANKS
}

/** Index of the first tiebreaker that differs between two same-category hands. */
export function firstDifference(a: Hand, b: Hand): number {
  return a.tiebreakers.findIndex((rank, i) => rank !== b.tiebreakers[i])
}

export function decidedByKicker(a: Hand, b: Hand): boolean {
  const madeRanks = MADE_RANKS[a.category]
  return a.category === b.category && madeRanks !== undefined && firstDifference(a, b) >= madeRanks
}
