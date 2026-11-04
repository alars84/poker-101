import { evaluateBestHand, isStraightOrBetter } from '../domain/hand'
import { chanceToHit, priceToCall } from '../domain/potOdds'
import { seededRng } from '../domain/seededRng'
import { dealOutsRound, potOddsChoices, UNSEEN_ON_TURN, type PotOddsSpot } from './outsAndOdds'
import { PRACTICE_TIPS } from './practiceRun'

const rng = seededRng(21)
const rounds = Array.from({ length: 200 }, () => dealOutsRound(rng))
const counting = rounds.filter((round) => round.topic === 'Counting outs')
const potOdds = rounds.filter((round) => round.topic === 'Pot odds')
const hasRepeatedRank = (ranks: readonly number[]) => new Set(ranks).size < ranks.length

describe('dealOutsRound', () => {
  it('asks both kinds of question, each with a practice tip', () => {
    expect(counting.length).toBeGreaterThan(50)
    expect(potOdds.length).toBeGreaterThan(50)
    expect(PRACTICE_TIPS['Counting outs']).toBeTruthy()
    expect(PRACTICE_TIPS['Pot odds']).toBeTruthy()
  })

  it('only deals drawing hands', () => {
    for (const { holeCards, board, outs } of rounds) {
      expect(hasRepeatedRank([...holeCards, ...board].map((card) => card.rank))).toBe(false)
      expect(isStraightOrBetter(evaluateBestHand([...board, ...holeCards]))).toBe(false)
      expect(outs.length).toBeGreaterThan(0)
    }
  })

  it('has exactly one correct option', () => {
    for (const { options } of rounds) {
      expect(options.filter((option) => option.correct)).toHaveLength(1)
      expect(new Set(options.map((option) => option.label)).size).toBe(options.length)
    }
  })

  it('offers four counts, including the real one, on the flop and the turn', () => {
    for (const { options, outs } of counting) {
      expect(options).toHaveLength(4)
      expect(options.find((option) => option.correct)?.label).toBe(String(outs.length))
    }
    expect(new Set(counting.map((round) => round.board.length))).toEqual(new Set([3, 4]))
  })

  it('aims for a mix of draws', () => {
    const counts = new Set(rounds.map((round) => round.outs.length))
    for (const count of [4, 8, 9]) expect(counts).toContain(count)
    expect([...counts].some((count) => count >= 12)).toBe(true)
  })

  it('asks pot odds on the turn, as call or fold', () => {
    for (const { board, options } of potOdds) {
      expect(board).toHaveLength(4)
      expect(options.map((option) => option.label)).toEqual(['Call', 'Fold'])
    }
  })

  it('calls and folds both come up', () => {
    const answers = new Set(potOdds.map((round) => round.options.find((option) => option.correct)?.label))
    expect(answers).toEqual(new Set(['Call', 'Fold']))
  })
})

describe('potOddsChoices', () => {
  const allSpots = Array.from({ length: 20 }, (_, i) => i + 1).flatMap((outs) => {
    const spots = potOddsChoices(outs)
    expect(spots.length).toBeGreaterThan(0)
    return spots.map((spot) => ({ outs, spot }))
  })

  const isCall = (outs: number, { ratio }: PotOddsSpot) => chanceToHit(outs, UNSEEN_ON_TURN) > priceToCall(ratio, 1)

  it('keeps at least a 5 point gap between the price and the chance to hit', () => {
    for (const { outs, spot } of allSpots) {
      expect(Math.abs(chanceToHit(outs, UNSEEN_ON_TURN) - priceToCall(spot.ratio, 1))).toBeGreaterThanOrEqual(0.05)
    }
  })

  it('makes the rule of 2 and the exact math agree', () => {
    for (const { outs, spot } of allSpots) {
      expect((outs * 2) / 100 > priceToCall(spot.ratio, 1)).toBe(isCall(outs, spot))
    }
  })
})
