import { BOARD_TEXTURES, boardTexture, possibleHandTiers, type BoardTexture, type PossibleHand } from '../domain/bestPossibleHand'
import { cardLabel, type Card } from '../domain/card'
import { Deck, shuffled, type Rng } from '../domain/deck'
import { evaluateBestHand, isStraightOrBetter, type Hand, type HandCategory } from '../domain/hand'
import { capitalize } from './capitalize'

export type BestPossibleOption = {
  readonly label: string
  readonly holeCards?: readonly Card[]
  readonly correct: boolean
}

export type BestPossibleRound = {
  readonly board: readonly Card[]
  readonly prompt: string
  readonly hand: Hand
  readonly holeCards: readonly Card[]
  readonly options: readonly BestPossibleOption[]
}

const OPTION_COUNT = 4
// Decoys come from just below the top, so the wrong options still look tempting.
const DECOY_TIERS = 6
// Dry boards, the rarest target, turn up about once in 60 deals.
const MAX_DEALS = 500

const CATEGORY_CHOICES: readonly HandCategory[] = [
  'three of a kind',
  'straight',
  'flush',
  'full house',
  'four of a kind',
  'straight flush',
]

export function dealBestPossibleRound(rng: Rng = Math.random): BestPossibleRound {
  const board = dealBoard(BOARD_TEXTURES[Math.floor(rng() * BOARD_TEXTURES.length)], rng)
  const tiers = possibleHandTiers(board)
  const [best] = tiers[0]
  const namesTheHand = rng() < 0.5
  return {
    board,
    hand: best.hand,
    holeCards: best.holeCards,
    prompt: namesTheHand
      ? 'What is the best possible hand on this board?'
      : 'Which hole cards make the best possible hand on this board?',
    options: namesTheHand ? categoryOptions(best.hand.category, rng) : holeCardOptions(tiers, rng),
  }
}

export function bestPossibleTopic(texture: BoardTexture): string {
  return `${capitalize(texture)} boards`
}

function dealBoard(target: BoardTexture, rng: Rng): Card[] {
  let board = new Deck(rng).deal(5)
  for (let i = 1; i < MAX_DEALS && !fits(board, target); i++) {
    board = new Deck(rng).deal(5)
  }
  return board
}

/** A board that makes a straight or better on its own can leave hole cards with nothing to add. */
function fits(board: readonly Card[], target: BoardTexture): boolean {
  return boardTexture(board) === target && !isStraightOrBetter(evaluateBestHand(board))
}

function categoryOptions(answer: HandCategory, rng: Rng): BestPossibleOption[] {
  const decoys = shuffled(
    CATEGORY_CHOICES.filter((category) => category !== answer),
    rng,
  ).slice(0, OPTION_COUNT - 1)
  return shuffled([answer, ...decoys], rng).map((category) => ({
    label: capitalize(category),
    correct: category === answer,
  }))
}

function holeCardOptions(tiers: readonly (readonly PossibleHand[])[], rng: Rng): BestPossibleOption[] {
  const decoys = shuffled(tiers.slice(1, 1 + DECOY_TIERS), rng).slice(0, OPTION_COUNT - 1)
  return shuffled([tiers[0], ...decoys], rng).map((tier) => ({
    label: tier[0].holeCards.map(cardLabel).join(' '),
    holeCards: tier[0].holeCards,
    correct: tier === tiers[0],
  }))
}
