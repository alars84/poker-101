import { startingHandOf } from '../domain/startingHand'
import { earliestOpeningSeat, SEATS, shouldOpen } from '../domain/openingChart'
import { seededRng } from '../domain/seededRng'
import { dealOpenOrFoldRound, isCorrectDecision, openOrFoldTopic } from './openOrFold'
import { PRACTICE_TIPS } from './practiceRun'

const rounds = (count: number, seed = 1) => {
  const rng = seededRng(seed)
  return Array.from({ length: count }, () => dealOpenOrFoldRound(rng))
}

describe('dealOpenOrFoldRound', () => {
  it('deals two cards and works out the right decision for the seat', () => {
    for (const round of rounds(200)) {
      expect(round.holeCards).toHaveLength(2)
      expect(round.decision).toBe(shouldOpen(startingHandOf(round.holeCards), round.seat) ? 'raise' : 'fold')
    }
  })

  it('uses every seat', () => {
    expect(new Set(rounds(100).map((round) => round.seat)).size).toBe(SEATS.length)
  })

  it('aims for about as many raises as folds', () => {
    const raises = rounds(1000).filter((round) => round.decision === 'raise').length
    expect(raises).toBeGreaterThan(420)
    expect(raises).toBeLessThan(580)
  })

  it('makes many early folds close calls, hands that open from a later seat', () => {
    const earlyFolds = rounds(3000).filter((round) => round.seat === 'early' && round.decision === 'fold')
    const close = earlyFolds.filter((round) => earliestOpeningSeat(startingHandOf(round.holeCards)) !== null)
    expect(close.length / earlyFolds.length).toBeGreaterThan(0.4)
  })
})

describe('isCorrectDecision', () => {
  it('accepts only the decision the chart makes', () => {
    const [round] = rounds(1)
    const other = round.decision === 'raise' ? 'fold' : 'raise'
    expect(isCorrectDecision(round, round.decision)).toBe(true)
    expect(isCorrectDecision(round, other)).toBe(false)
  })
})

describe('openOrFoldTopic', () => {
  it('files each seat under a topic with a practice tip', () => {
    expect(SEATS.map(openOrFoldTopic)).toEqual(['Early position', 'Middle position', 'Late position'])
    for (const seat of SEATS) expect(PRACTICE_TIPS[openOrFoldTopic(seat)]).toBeTruthy()
  })
})
