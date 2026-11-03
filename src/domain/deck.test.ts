import { cardLabel } from './card'
import { seededRng } from '../testing/seededRng'
import { Deck, shuffled } from './deck'

const labels = (deck: Deck, count: number) => deck.deal(count).map(cardLabel)

describe('Deck', () => {
  it('starts with 52 cards', () => {
    expect(new Deck(seededRng(1)).remaining).toBe(52)
  })

  it('shuffles the same way for the same random source', () => {
    expect(labels(new Deck(seededRng(7)), 52)).toEqual(labels(new Deck(seededRng(7)), 52))
  })

  it('shuffles differently for a different random source', () => {
    expect(labels(new Deck(seededRng(7)), 52)).not.toEqual(labels(new Deck(seededRng(8)), 52))
  })

  it('never deals the same card twice', () => {
    const deck = new Deck(seededRng(3))
    const dealt = [...labels(deck, 20), ...labels(deck, 32)]
    expect(new Set(dealt).size).toBe(52)
  })

  it('removes dealt cards from the deck', () => {
    const deck = new Deck(seededRng(3))
    deck.deal(5)
    expect(deck.remaining).toBe(47)
  })

  it('refuses to deal more cards than remain', () => {
    const deck = new Deck(seededRng(3))
    deck.deal(50)
    expect(() => deck.deal(3)).toThrow()
  })
})

describe('shuffled', () => {
  it('keeps every item and leaves the original alone', () => {
    const items = [1, 2, 3, 4, 5]
    const result = shuffled(items, seededRng(2))
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
    expect(items).toEqual([1, 2, 3, 4, 5])
  })
})
