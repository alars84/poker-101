import type { Card } from '../domain/card'
import { Deck, shuffled, type Rng } from '../domain/deck'
import { explainOuts, explainPotOdds, outsLabel } from '../domain/explanation'
import { evaluateBestHand, isStraightOrBetter } from '../domain/hand'
import { findOuts } from '../domain/outs'
import { chanceToHit, priceToCall } from '../domain/potOdds'

export type OutsOption = { readonly label: string; readonly correct: boolean }

export type OutsRound = {
  readonly topic: string
  readonly prompt: string
  readonly board: readonly Card[]
  readonly holeCards: readonly Card[]
  readonly outs: readonly Card[]
  readonly options: readonly OutsOption[]
  readonly explanation: string
}

/** A pot size, as a multiple of the call. */
export type PotOddsSpot = { readonly ratio: number }

type Draw = { readonly board: readonly Card[]; readonly holeCards: readonly Card[]; readonly outs: readonly Card[] }

export const UNSEEN_ON_TURN = 46

const FLOP = 3
const TURN = 4
const COMBO_DRAW_OUTS = 12
const COUNT_CHOICES = [4, 6, 8, 9, 12, 15]
const COUNT_OPTIONS = 4
// A pot-sized bet makes the pot two calls, so no spot starts below 2.
const POT_RATIOS = [2, 3, 4, 6, 8, 10]
const CALL_SIZES = [10, 20, 30, 40, 50]
const CLEAR_GAP = 0.05
// After this many deals, any draw will do. Combo draws, the rarest target, come about once in 20.
const MAX_DEALS_FOR_TARGET = 500

const DRAW_TARGETS: readonly ((outs: number) => boolean)[] = [
  (outs) => outs === 4,
  (outs) => outs === 8,
  (outs) => outs === 9,
  (outs) => outs >= COMBO_DRAW_OUTS,
]

export function dealOutsRound(rng: Rng = Math.random): OutsRound {
  return rng() < 0.5 ? dealCountingRound(rng) : dealPotOddsRound(rng)
}

/** The spots where a beginner's math gives a clear answer for this many outs. */
export function potOddsChoices(outs: number): PotOddsSpot[] {
  const chance = chanceToHit(outs, UNSEEN_ON_TURN)
  const estimate = (outs * 2) / 100
  return POT_RATIOS.filter((ratio) => {
    const price = priceToCall(ratio, 1)
    return Math.abs(chance - price) >= CLEAR_GAP && chance > price === estimate > price
  }).map((ratio) => ({ ratio }))
}

function dealCountingRound(rng: Rng): OutsRound {
  const boardSize = rng() < 0.5 ? FLOP : TURN
  const draw = dealDraw(boardSize, rng)
  const count = draw.outs.length
  const decoys = shuffled(
    COUNT_CHOICES.filter((choice) => choice !== count),
    rng,
  ).slice(0, COUNT_OPTIONS - 1)
  return {
    ...draw,
    topic: 'Counting outs',
    prompt: 'How many cards make you a straight or better?',
    options: [count, ...decoys]
      .sort((a, b) => a - b)
      .map((choice) => ({ label: String(choice), correct: choice === count })),
    explanation: explainOuts(count, boardSize === FLOP ? 2 : 1),
  }
}

function dealPotOddsRound(rng: Rng): OutsRound {
  const draw = dealDraw(TURN, rng)
  const count = draw.outs.length
  const spots = potOddsChoices(count)
  const { ratio } = spots[Math.floor(rng() * spots.length)]
  const call = CALL_SIZES[Math.floor(rng() * CALL_SIZES.length)]
  const pot = call * ratio
  const shouldCall = chanceToHit(count, UNSEEN_ON_TURN) > priceToCall(pot, call)
  return {
    ...draw,
    topic: 'Pot odds',
    prompt: `You have ${outsLabel(count)}. The pot is $${pot} and it costs $${call} to call. Call or fold?`,
    options: [
      { label: 'Call', correct: shouldCall },
      { label: 'Fold', correct: !shouldCall },
    ],
    explanation: explainPotOdds(count, pot, call),
  }
}

/** Aims for a random kind of draw, because plain deals rarely have one. */
function dealDraw(boardSize: number, rng: Rng): Draw {
  const isTarget = DRAW_TARGETS[Math.floor(rng() * DRAW_TARGETS.length)]
  for (let i = 0; ; i++) {
    const deck = new Deck(rng)
    const holeCards = deck.deal(2)
    const board = deck.deal(boardSize)
    if (!isPlainDraw(holeCards, board)) continue
    const outs = findOuts(holeCards, board)
    if (outs.length > 0 && (isTarget(outs.length) || i >= MAX_DEALS_FOR_TARGET)) return { board, holeCards, outs }
  }
}

/** Pairs and made hands bring outs of their own, which is a lesson for later. */
function isPlainDraw(holeCards: readonly Card[], board: readonly Card[]): boolean {
  const cards = [...board, ...holeCards]
  const hasPair = new Set(cards.map((card) => card.rank)).size < cards.length
  return !hasPair && !isStraightOrBetter(evaluateBestHand(cards))
}
