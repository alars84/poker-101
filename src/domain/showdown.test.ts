import { cards } from './card'
import { resolveShowdown, type Player } from './showdown'

const player = (name: string, holeCards: string): Player => ({ name, holeCards: cards(holeCards) })
const winnerNames = (board: string, ...players: Player[]) =>
  resolveShowdown(cards(board), players).winners.map((winner) => winner.name)

describe('resolveShowdown', () => {
  it('names the player with the best hand as the winner', () => {
    expect(winnerNames('Kh 9d 5c 3s 2h', player('Ana', 'Ks Qd'), player('Ben', 'Jh Td'))).toEqual(['Ana'])
  })

  it('names every player tied for best as a winner', () => {
    expect(
      winnerNames('Kh 9d 5c 3s 2h', player('Ana', 'Ks Qd'), player('Ben', 'Kd Qc'), player('Cara', 'Jh Td')),
    ).toEqual(['Ana', 'Ben'])
  })

  it('gives each player their own best hand', () => {
    const { hands } = resolveShowdown(cards('Kh 9d 5c 3s 2h'), [player('Ana', 'Ks Qd'), player('Ben', '9s 9c')])
    expect(hands.map((hand) => hand.category)).toEqual(['pair', 'three of a kind'])
  })

  it('reaches for board cards first when a hole card only duplicates one', () => {
    const { hands } = resolveShowdown(cards('Ah Kd Qc Js Th'), [player('Ana', 'As 2c')])
    expect(hands[0].cards).toEqual(cards('Ah Kd Qc Js Th'))
  })
})

describe('the deciding factor of a showdown', () => {
  const deciding = (board: string, ...players: Player[]) => resolveShowdown(cards(board), players).scenario

  it('is different-category when one hand type beats another', () => {
    expect(deciding('Kh 9d 5c 3s 2h', player('Ana', 'Ks 9c'), player('Ben', 'Kd Qc'))).toBe('different-category')
  })

  it('is higher-rank when the same hand type differs in rank', () => {
    expect(deciding('Kh 9d 5c 3s 2h', player('Ana', 'Ks Qd'), player('Ben', '9s Jc'))).toBe('higher-rank')
  })

  it('is kicker when the same made hand is split by a side card', () => {
    expect(deciding('Kh 9d 5c 3s 2h', player('Ana', 'Ks Ad'), player('Ben', 'Kd Qc'))).toBe('kicker')
  })

  it('is split-pot when players tie using their hole cards', () => {
    expect(deciding('Kh 9d 5c 3s 2h', player('Ana', 'Ks Qd'), player('Ben', 'Kd Qc'))).toBe('split-pot')
  })

  it('is board-plays when the board beats every hole card', () => {
    expect(deciding('Ah Kd Qc Js Th', player('Ana', '2s 3d'), player('Ben', '4d 5c'))).toBe('board-plays')
  })

  it('still is board-plays when a hole card ties a board card', () => {
    expect(deciding('Ah Kd Qc Js Th', player('Ana', 'As 3d'), player('Ben', '4d 5c'))).toBe('board-plays')
  })

  it('compares the winner with the closest loser in a three-way pot', () => {
    expect(
      deciding('Kh 9d 5c 3s 2h', player('Ana', 'Ks Ad'), player('Ben', 'Kd Qc'), player('Cara', '7d 8c')),
    ).toBe('kicker')
  })
})
