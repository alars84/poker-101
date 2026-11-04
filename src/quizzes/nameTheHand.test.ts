import { seededRng } from '../domain/seededRng'
import { dealNameTheHandRound, isCorrectName } from './nameTheHand'

describe('dealNameTheHandRound', () => {
  it('deals two hole cards and five board cards', () => {
    const round = dealNameTheHandRound(seededRng(1))
    expect(round.holeCards).toHaveLength(2)
    expect(round.board).toHaveLength(5)
  })

  it('spreads practice across hand categories instead of mostly pairs', () => {
    const rng = seededRng(6)
    const categories = new Set(Array.from({ length: 60 }, () => dealNameTheHandRound(rng).hand.category))
    expect(categories.size).toBeGreaterThanOrEqual(7)
  })

  it('still deals when the wanted category never comes up', () => {
    expect(dealNameTheHandRound(() => 0).board).toHaveLength(5)
  })
})

describe('isCorrectName', () => {
  it('accepts only the category of the best hand', () => {
    const round = dealNameTheHandRound(seededRng(1))
    expect(isCorrectName(round, round.hand.category)).toBe(true)
    expect(isCorrectName(round, round.hand.category === 'pair' ? 'flush' : 'pair')).toBe(false)
  })
})
