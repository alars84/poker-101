import { allCards, sameCard, type Card } from './card'
import { compareHands, evaluateBestHand, type Hand } from './hand'

export const BOARD_TEXTURES = ['paired', 'flush', 'straight', 'dry'] as const
export type BoardTexture = (typeof BOARD_TEXTURES)[number]

export type PossibleHand = { readonly hand: Hand; readonly holeCards: readonly Card[] }

const ACE_HIGH = 14
const ACE_LOW = 1
const STRAIGHT_SPAN = 5
const CARDS_TO_COMPLETE = 3

/** What a five-card board makes possible, checked in the order that decides the best hand. */
export function boardTexture(board: readonly Card[]): BoardTexture {
  const ranks = board.map((card) => card.rank)
  if (new Set(ranks).size < ranks.length) return 'paired'
  if (board.some(({ suit }) => board.filter((card) => card.suit === suit).length >= CARDS_TO_COMPLETE)) return 'flush'
  return allowsStraight(ranks) ? 'straight' : 'dry'
}

/** Every hole card pair, grouped by equal strength, strongest group first. */
export function possibleHandTiers(board: readonly Card[]): PossibleHand[][] {
  const hands = unseenPairs(board)
    .map((holeCards) => ({ holeCards, hand: evaluateBestHand([...board, ...holeCards]) }))
    .sort((a, b) => compareHands(b.hand, a.hand))

  const tiers: PossibleHand[][] = []
  for (const possible of hands) {
    const tier = tiers.at(-1)
    if (tier && compareHands(tier[0].hand, possible.hand) === 0) tier.push(possible)
    else tiers.push([possible])
  }
  return tiers
}

function allowsStraight(ranks: readonly number[]): boolean {
  const values = ranks.flatMap((rank) => (rank === ACE_HIGH ? [ACE_HIGH, ACE_LOW] : [rank]))
  return values.some(
    (low) => values.filter((value) => value >= low && value < low + STRAIGHT_SPAN).length >= CARDS_TO_COMPLETE,
  )
}

function unseenPairs(board: readonly Card[]): Card[][] {
  const unseen = allCards().filter((card) => !board.some((seen) => sameCard(seen, card)))
  return unseen.flatMap((first, i) => unseen.slice(i + 1).map((second) => [first, second]))
}
