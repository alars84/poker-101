import { cards, type Card } from './card'
import { Deck } from './deck'
import { boardTexture, possibleHandTiers } from './bestPossibleHand'
import { compareHands } from './hand'
import { seededRng } from '../testing/seededRng'

const best = (board: string) => possibleHandTiers(cards(board))[0][0]

describe('boardTexture', () => {
  it.each([
    ['Kh Kd 7c 4s 2h', 'paired'],
    ['Kh Kd Kc 4s 2h', 'paired'],
    ['Ah 9h 4h 8c 2d', 'flush'],
    ['Kh 9d 8c 7s 2h', 'straight'],
    ['Ah 2d 3c 9s Kd', 'straight'],
    ['Kh 9d 5c 3s 2h', 'straight'],
    ['Kh 9d 8c 4s 2h', 'dry'],
  ])('reads %s as %s', (board, texture) => {
    expect(boardTexture(cards(board))).toBe(texture)
  })

  it('counts pairing first, since a paired flush board still makes four of a kind', () => {
    expect(boardTexture(cards('Ah Kh 4h 4d 9c'))).toBe('paired')
  })
})

describe('possibleHandTiers', () => {
  it('finds top set on a dry board', () => {
    const { hand, holeCards } = best('Kh 9d 8c 4s 2h')
    expect(hand.category).toBe('three of a kind')
    expect(holeCards.map((card) => card.rank)).toEqual([13, 13])
  })

  it('finds four of a kind on a paired board', () => {
    const { hand, holeCards } = best('Kh Kd 7c 4s 2h')
    expect(hand.category).toBe('four of a kind')
    expect(holeCards.map((card) => card.rank)).toEqual([13, 13])
  })

  it('finds the ace-high flush when no straight flush is possible', () => {
    const { hand, holeCards } = best('Kh 9h 4h 8c 2d')
    expect(hand.category).toBe('flush')
    expect(holeCards.some((card) => card.rank === 14 && card.suit === 'hearts')).toBe(true)
  })

  it('finds the straight flush when one is possible', () => {
    expect(best('9h 8h 7h Kc 2d').hand.category).toBe('straight flush')
  })

  it('puts every way of making the same hand in the same tier', () => {
    expect(possibleHandTiers(cards('Kh Kd 7c 4s 2h'))[0]).toHaveLength(1)
    const tiers = possibleHandTiers(cards('Kh 9h 4h 8c 2d'))
    for (const { hand } of tiers[0]) expect(compareHands(hand, tiers[0][0].hand)).toBe(0)
  })

  it('orders tiers strongest first, and uses every unseen pair of cards', () => {
    const tiers = possibleHandTiers(cards('Kh 9d 5c 3s 2h'))
    for (let i = 1; i < tiers.length; i++) {
      expect(compareHands(tiers[i - 1][0].hand, tiers[i][0].hand)).toBeGreaterThan(0)
    }
    expect(tiers.flat()).toHaveLength(1081)
  })

  it('agrees with the texture on every kind of board, so a full house is never best', () => {
    const rng = seededRng(5)
    for (let i = 0; i < 60; i++) {
      const board: Card[] = new Deck(rng).deal(5)
      const { hand } = possibleHandTiers(board)[0][0]
      const allowed = {
        paired: ['four of a kind', 'straight flush', 'royal flush'],
        flush: ['flush', 'straight flush', 'royal flush'],
        straight: ['straight'],
        dry: ['three of a kind'],
      }[boardTexture(board)]
      expect(allowed).toContain(hand.category)
    }
  })
})
