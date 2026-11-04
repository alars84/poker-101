import { cards } from '../domain/card'
import { resolveShowdown } from '../domain/showdown'
import { seededRng } from '../testing/seededRng'
import { dealWhoWinsRound, isCorrectPick, type ShowdownRound } from './whoWins'

function round(board: string, ...holeCards: string[]): ShowdownRound {
  const players = holeCards.map((hole, i) => ({ name: ['Ana', 'Ben', 'Cara'][i], holeCards: cards(hole) }))
  return { board: cards(board), players, result: resolveShowdown(cards(board), players) }
}

describe('dealWhoWinsRound', () => {
  it('seats two or three players', () => {
    const rng = seededRng(4)
    const seats = new Set(Array.from({ length: 30 }, () => dealWhoWinsRound(rng).players.length))
    expect(seats).toEqual(new Set([2, 3]))
  })

  it('works through every scenario over a session', () => {
    const rng = seededRng(9)
    const scenarios = new Set(Array.from({ length: 40 }, () => dealWhoWinsRound(rng).result.scenario))
    expect(scenarios.size).toBe(5)
  })
})

describe('isCorrectPick', () => {
  const single = round('Kh 9d 5c 3s 2h', 'Ks Ad', 'Kd Qc')
  const split = round('Kh 9d 5c 3s 2h', 'Ks Qd', 'Kd Qc', '7d 8c')

  it('accepts the winner', () => {
    expect(isCorrectPick(single, ['Ana'])).toBe(true)
  })

  it('rejects a loser', () => {
    expect(isCorrectPick(single, ['Ben'])).toBe(false)
  })

  it('rejects calling a split when one player wins', () => {
    expect(isCorrectPick(single, ['Ana', 'Ben'])).toBe(false)
  })

  it('needs every player in a split pot', () => {
    expect(isCorrectPick(split, ['Ana'])).toBe(false)
    expect(isCorrectPick(split, ['Ben', 'Ana'])).toBe(true)
  })

  it('rejects an extra player on a split pot', () => {
    expect(isCorrectPick(split, ['Ana', 'Ben', 'Cara'])).toBe(false)
  })
})
