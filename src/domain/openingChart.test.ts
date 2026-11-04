import { allCards, cards } from './card'
import { earliestOpeningSeat, SEATS, shouldOpen } from './openingChart'
import { startingHandOf } from './startingHand'

const hand = (shorthand: string) => startingHandOf(cards(shorthand))

const allHands = allCards().flatMap((first, i) =>
  allCards()
    .slice(i + 1)
    .map((second) => startingHandOf([first, second])),
)

describe('shouldOpen', () => {
  it.each([
    ['Ah Ad', 'early'],
    ['7h 7d', 'early'],
    ['Ah Qd', 'early'],
    ['Qh Jh', 'early'],
    ['5h 5d', 'middle'],
    ['Kh Qd', 'middle'],
    ['Th 9h', 'middle'],
    ['2h 2d', 'late'],
    ['Ah 2h', 'late'],
    ['6h 5h', 'late'],
    ['Jh Td', 'late'],
  ] as const)('opens %s from %s position', (shorthand, seat) => {
    expect(shouldOpen(hand(shorthand), seat)).toBe(true)
  })

  it.each([
    ['6h 6d', 'early'],
    ['Ah Jd', 'early'],
    ['4h 4d', 'middle'],
    ['Ah 8h', 'middle'],
    ['Ah 9d', 'late'],
    ['Kh 7h', 'late'],
    ['5h 4h', 'late'],
    ['7h 2d', 'late'],
  ] as const)('folds %s from %s position', (shorthand, seat) => {
    expect(shouldOpen(hand(shorthand), seat)).toBe(false)
  })

  it('never takes a hand away as the seat gets later', () => {
    for (const startingHand of allHands) {
      const opens = SEATS.map((seat) => shouldOpen(startingHand, seat))
      expect(opens).toEqual(opens.toSorted())
    }
  })
})

describe('earliestOpeningSeat', () => {
  it('finds the first seat that opens a hand', () => {
    expect(earliestOpeningSeat(hand('Ah Ad'))).toBe('early')
    expect(earliestOpeningSeat(hand('Kh Qd'))).toBe('middle')
    expect(earliestOpeningSeat(hand('Jh Td'))).toBe('late')
  })

  it('has no seat for a hand that never opens', () => {
    expect(earliestOpeningSeat(hand('7h 2d'))).toBeNull()
  })
})
