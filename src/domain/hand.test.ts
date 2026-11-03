import { allCards, cards } from './card'
import { compareHands, decidedByKicker, evaluateBestHand, HAND_CATEGORIES, type HandCategory } from './hand'

const best = (shorthand: string) => evaluateBestHand(cards(shorthand))
const categoryOf = (shorthand: string) => best(shorthand).category

/** Positive when the first seven cards make the better hand. */
const compare = (a: string, b: string) => compareHands(best(a), best(b))

describe('evaluateBestHand names each category', () => {
  const examples: [HandCategory, string][] = [
    ['high card', 'Ah Jd 9c 7s 5h 3d 2c'],
    ['pair', 'Ah Ad 9c 7s 5h 3d 2c'],
    ['two pair', 'Ah Ad 9c 9s 5h 3d 2c'],
    ['three of a kind', 'Ah Ad Ac 9s 5h 3d 2c'],
    ['straight', '9h 8d 7c 6s 5h Ad 2c'],
    ['flush', 'Ah Jh 9h 7h 2h 3d 4c'],
    ['full house', 'Ah Ad Ac 9s 9h 3d 2c'],
    ['four of a kind', 'Ah Ad Ac As 9h 3d 2c'],
    ['straight flush', '9h 8h 7h 6h 5h Ad 2c'],
    ['royal flush', 'Ah Kh Qh Jh Th 3d 2c'],
  ]

  it.each(examples)('%s', (category, hand) => {
    expect(categoryOf(hand)).toBe(category)
  })

  it('ranks the categories from weakest to strongest', () => {
    expect(HAND_CATEGORIES[0]).toBe('high card')
    expect(HAND_CATEGORIES[9]).toBe('royal flush')
    expect(HAND_CATEGORIES).toHaveLength(10)
  })
})

describe('straights', () => {
  it('lets the ace play low in the wheel', () => {
    expect(categoryOf('Ah 2d 3c 4s 5h 9d Kc')).toBe('straight')
  })

  it('lets the ace play high in Broadway', () => {
    expect(categoryOf('Ah Kd Qc Js Th 3d 2c')).toBe('straight')
  })

  it('does not wrap around the ace', () => {
    expect(categoryOf('Qh Kd Ac 2s 3h 7d 9c')).toBe('high card')
  })

  it('counts the wheel as the lowest straight', () => {
    expect(compare('2h 3d 4c 5s 6h Jd Kc', 'Ah 2d 3c 4s 5h Jd Kc')).toBeGreaterThan(0)
  })

  it('counts a steel wheel as a straight flush, not a royal', () => {
    expect(categoryOf('Ah 2h 3h 4h 5h 9d Kc')).toBe('straight flush')
  })

  it('takes the higher straight when six cards connect', () => {
    expect(compare('4h 5d 6c 7s 8h 9d Kc', '4h 5d 6c 7s 8h 2d Kc')).toBeGreaterThan(0)
  })
})

describe('only five cards play', () => {
  it('keeps just five cards in the best hand', () => {
    expect(best('Ah Ad Kc Qs Jh 9d 2c').cards).toHaveLength(5)
  })

  it('ties when the difference is in a sixth card', () => {
    expect(compare('Ah Ad Kc Qs Jh 9d 2c', 'Ah Ad Kc Qs Jh 8d 2c')).toBe(0)
  })

  it('breaks a tie on the fifth card', () => {
    expect(compare('Ah Ad Kc Qs Jh 3d 2c', 'Ah Ad Kc Qs Th 3d 2c')).toBeGreaterThan(0)
  })
})

describe('picking the best combination', () => {
  it('takes the two best of three pairs', () => {
    const hand = best('Ah Ad Kc Ks 7h 7d 2c')
    expect(hand.category).toBe('two pair')
    expect(hand.tiebreakers).toEqual([14, 13, 7])
  })

  it('takes the best kicker over a third pair', () => {
    expect(compare('Ah Ad Kc Ks 7h 7d Qc', 'Ah Ad Kc Ks 7h 7d 2c')).toBeGreaterThan(0)
  })

  it('makes a full house from two sets', () => {
    const hand = best('Ah Ad Ac Ks Kh Kd 2c')
    expect(hand.category).toBe('full house')
    expect(hand.tiebreakers).toEqual([14, 13])
  })

  it('makes the higher full house from a set and two pairs', () => {
    expect(best('5h 5d 5c Ks Kh Qd Qc').tiebreakers).toEqual([5, 13])
  })

  it('picks the highest five of six suited cards', () => {
    expect(best('Ah Kh 9h 7h 4h 2h 3d').tiebreakers).toEqual([14, 13, 9, 7, 4])
  })

  it('prefers a straight flush to a higher plain flush', () => {
    expect(categoryOf('9h 8h 7h 6h 5h Ah Kd')).toBe('straight flush')
  })
})

describe('comparing hands of the same category', () => {
  it('a higher category always wins', () => {
    expect(compare('2h 2d 3c 3s 7h Jd Kc', 'Ah Ad 9c 7s 5h 3d 2c')).toBeGreaterThan(0)
  })

  it('a higher pair wins', () => {
    expect(compare('Kh Kd 9c 7s 5h 3d 2c', 'Qh Qd Ac 9s 7h 5d 2c')).toBeGreaterThan(0)
  })

  it('compares two pair by the top pair, then the bottom pair', () => {
    expect(compare('Ah Ad 3c 3s 9h 7d 5c', 'Kh Kd Qc Qs 9h 7d 5c')).toBeGreaterThan(0)
    expect(compare('Ah Ad 4c 4s 9h 7d 5c', 'Ah Ad 3c 3s 9h 7d 5c')).toBeGreaterThan(0)
  })

  it('compares flushes card by card', () => {
    expect(compare('Ah Kh 9h 7h 3h 2d 4c', 'Ah Kh 9h 6h 5h 2d 4c')).toBeGreaterThan(0)
  })

  it('compares full houses by the set first', () => {
    expect(compare('3h 3d 3c 2s 2h 7d 9c', '2h 2d 2c As Ah 7d 9c')).toBeGreaterThan(0)
  })

  it('compares four of a kind by the kicker', () => {
    expect(compare('9h 9d 9c 9s Ah 2d 3c', '9h 9d 9c 9s Kh 2d 3c')).toBeGreaterThan(0)
  })
})

describe('decidedByKicker', () => {
  it('is true when the made hand ties and a side card differs', () => {
    expect(decidedByKicker(best('Kh Kd Ac 9s 7h 3d 2c'), best('Kh Kd Qc 9s 7h 3d 2c'))).toBe(true)
  })

  it('is false when the made hand itself differs', () => {
    expect(decidedByKicker(best('Kh Kd 9c 7s 5h 3d 2c'), best('Qh Qd Ac 9s 7h 5d 2c'))).toBe(false)
  })

  it('is false for hands with no side cards, like flushes', () => {
    expect(decidedByKicker(best('Ah Kh 9h 7h 3h 2d 4c'), best('Ah Kh 9h 6h 5h 2d 4c'))).toBe(false)
  })

  it('checks both pairs before calling two pair a kicker', () => {
    expect(decidedByKicker(best('Ah Ad 4c 4s 9h 7d 5c'), best('Ah Ad 3c 3s 9h 7d 5c'))).toBe(false)
    expect(decidedByKicker(best('Ah Ad 4c 4s 9h 7d 5c'), best('Ah Ad 4c 4s 8h 7d 5c'))).toBe(true)
  })
})

describe('every possible five-card hand', () => {
  it('matches the published count for each category', () => {
    const deck = allCards()
    const counts = new Map<HandCategory, number>()
    for (let a = 0; a < 48; a++)
      for (let b = a + 1; b < 49; b++)
        for (let c = b + 1; c < 50; c++)
          for (let d = c + 1; d < 51; d++)
            for (let e = d + 1; e < 52; e++) {
              const { category } = evaluateBestHand([deck[a], deck[b], deck[c], deck[d], deck[e]])
              counts.set(category, (counts.get(category) ?? 0) + 1)
            }

    expect(Object.fromEntries(counts)).toEqual({
      'royal flush': 4,
      'straight flush': 36,
      'four of a kind': 624,
      'full house': 3744,
      flush: 5108,
      straight: 10200,
      'three of a kind': 54912,
      'two pair': 123552,
      pair: 1098240,
      'high card': 1302540,
    })
  }, 60_000)
})
