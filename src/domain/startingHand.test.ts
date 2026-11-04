import { cards } from './card'
import { startingHandOf, startingHandShape } from './startingHand'

const hand = (shorthand: string) => startingHandOf(cards(shorthand))

describe('startingHandOf', () => {
  it('labels a pair by its rank alone', () => {
    expect(hand('7h 7c').label).toBe('77')
  })

  it('marks suited and offsuit hands', () => {
    expect(hand('Ah Kh').label).toBe('AKs')
    expect(hand('Ah Kd').label).toBe('AKo')
  })

  it('puts the higher card first, whichever was dealt first', () => {
    expect(hand('Ts Jd').label).toBe('JTo')
  })

  it('writes a ten as T', () => {
    expect(hand('Ts 9s').label).toBe('T9s')
  })

  it('rejects anything but two cards', () => {
    expect(() => hand('Ah')).toThrow()
  })
})

describe('startingHandShape', () => {
  it.each([
    ['2h 2c', 'pair'],
    ['Ah 5h', 'suited ace'],
    ['Ah Kd', 'big cards'],
    ['Qh Th', 'big cards'],
    ['7h 6h', 'suited connector'],
    ['9h 7h', 'suited connector'],
    ['Ah 9d', 'weak'],
    ['Kh 8h', 'weak'],
    ['7h 2d', 'weak'],
  ])('reads %s as %s', (shorthand, shape) => {
    expect(startingHandShape(hand(shorthand))).toBe(shape)
  })
})
