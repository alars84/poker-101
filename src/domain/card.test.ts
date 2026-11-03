import { allCards, card, cardLabel } from './card'

describe('Card', () => {
  it('there are 52 distinct cards', () => {
    const cards = allCards()
    expect(cards).toHaveLength(52)
    expect(new Set(cards.map(cardLabel)).size).toBe(52)
  })

  it('parses shorthand like "Ah" into a rank and suit', () => {
    expect(card('Ah')).toEqual({ rank: 14, suit: 'hearts' })
    expect(card('Ts')).toEqual({ rank: 10, suit: 'spades' })
    expect(card('2c')).toEqual({ rank: 2, suit: 'clubs' })
  })

  it('rejects shorthand that is not a card', () => {
    expect(() => card('1x')).toThrow()
  })

  it('labels a card with its rank and suit symbol', () => {
    expect(cardLabel(card('Td'))).toBe('10♦')
    expect(cardLabel(card('Ks'))).toBe('K♠')
  })
})
