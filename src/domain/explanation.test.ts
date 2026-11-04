import { cards } from './card'
import { describeHand, explainOpening, explainOuts, explainPotOdds, explainShowdown } from './explanation'
import { evaluateBestHand } from './hand'
import { resolveShowdown, type Player } from './showdown'
import { startingHandOf } from './startingHand'

const player = (name: string, holeCards: string): Player => ({ name, holeCards: cards(holeCards) })
const explain = (board: string, ...players: Player[]) => explainShowdown(resolveShowdown(cards(board), players))

describe('describeHand', () => {
  const examples: [string, string][] = [
    ['Ah Jd 9c 7s 5h 3d 2c', 'ace high'],
    ['Kh Kd 9c 7s 5h 3d 2c', 'a pair of kings'],
    ['Ah Ad 3c 3s 9h 7d 5c', 'two pair, aces and threes'],
    ['6h 6d 6c 9s 5h 3d 2c', 'three sixes'],
    ['9h 8d 7c 6s 5h Ad 2c', 'a straight to the nine'],
    ['Ah 2d 3c 4s 5h 9d Kc', 'a straight to the five'],
    ['Ah Jh 9h 7h 2h 3d 4c', 'a flush, A J 9 7 2'],
    ['3h 3d 3c 2s 2h 7d 9c', 'a full house, threes over twos'],
    ['9h 9d 9c 9s Ah 2d 3c', 'four nines'],
    ['9h 8h 7h 6h 5h Ad 2c', 'a straight flush to the nine'],
    ['Ah Kh Qh Jh Th 3d 2c', 'a royal flush'],
  ]

  it.each(examples)('%s reads as "%s"', (hand, description) => {
    expect(describeHand(evaluateBestHand(cards(hand)))).toBe(description)
  })
})

describe('explainShowdown', () => {
  it('names both hands when the category decides it', () => {
    expect(explain('Kh 9d 5c 3s 2h', player('Ana', 'Ks 9c'), player('Ben', 'Kd Qc'))).toBe(
      "Ana's two pair, kings and nines beats Ben's pair of kings.",
    )
  })

  it('names both hands when the rank decides it', () => {
    expect(explain('Kh 9d 5c 3s 2h', player('Ana', 'Ks Qd'), player('Ben', '9s Jc'))).toBe(
      "Ana's pair of kings beats Ben's pair of nines.",
    )
  })

  it('names the kickers when a kicker decides it', () => {
    expect(explain('Kh 9d 5c 3s 2h', player('Ana', 'Ks Ad'), player('Ben', 'Kd Qc'))).toBe(
      "Both have a pair of kings. Ana's ace kicker beats Ben's queen.",
    )
  })

  it('names the first kicker that differs', () => {
    expect(explain('Kh Ad 5c 3s 2h', player('Ana', 'Ks Qd'), player('Ben', 'Kd Jc'))).toBe(
      "Both have a pair of kings. Ana's queen kicker beats Ben's jack.",
    )
  })

  it('names who splits a tied pot', () => {
    expect(explain('Kh 9d 5c 3s 2h', player('Ana', 'Ks Qd'), player('Ben', 'Kd Qc'), player('Cara', '7d 8c'))).toBe(
      'Ana and Ben tie with a pair of kings and the same kickers, so they split the pot.',
    )
  })

  it('leaves out kickers when a tied hand has none', () => {
    expect(explain('9h 8d 7c 2s 2h', player('Ana', 'Js Td'), player('Ben', 'Jd Tc'))).toBe(
      'Ana and Ben tie with a straight to the jack, so they split the pot.',
    )
  })

  it('tells the table when the board plays', () => {
    expect(explain('Ah Kd Qc Js Th', player('Ana', '2s 3d'), player('Ben', '4d 5c'))).toBe(
      'The board makes a straight to the ace. No hole card beats it, so everyone splits the pot.',
    )
  })
})

describe('explainOpening', () => {
  const hand = (shorthand: string) => startingHandOf(cards(shorthand))

  it('says where a hand opens and why', () => {
    expect(explainOpening(hand('Kh Qd'))).toBe(
      'KQo (offsuit) opens from middle position or later. Big cards make strong top pairs, but a weak kicker can lose a big pot.',
    )
  })

  it('says when every seat opens a hand', () => {
    expect(explainOpening(hand('Ah Ad'))).toMatch(/^AA opens from any seat\./)
  })

  it('says when only the latest seats open a hand', () => {
    expect(explainOpening(hand('2h 2d'))).toMatch(/^22 opens from late position only\./)
  })

  it('says when no seat opens a hand', () => {
    expect(explainOpening(hand('7h 2d'))).toMatch(/^72o \(offsuit\) doesn't open from any seat\./)
  })

  it('spells out suited hands', () => {
    expect(explainOpening(hand('Ah 5h'))).toMatch(/^A5s \(suited\)/)
  })
})

describe('explainOuts', () => {
  it('uses the rule of 4 with two cards to come', () => {
    expect(explainOuts(9, 2)).toBe('You have 9 outs. With two cards to come, multiply by 4: about 36%.')
  })

  it('uses the rule of 2 with one card to come', () => {
    expect(explainOuts(8, 1)).toBe('You have 8 outs. With one card to come, multiply by 2: about 16%.')
  })
})

describe('explainPotOdds', () => {
  it('compares the price to the chance of hitting', () => {
    expect(explainPotOdds(9, 120, 20)).toBe(
      'Your $20 call goes into a final pot of $140, so you need to hit about 14% of the time. 9 outs times 2 is about 18%, so call.',
    )
  })

  it('says to fold when the price is too high', () => {
    expect(explainPotOdds(4, 40, 20)).toMatch(/you need to hit about 33% of the time\. 4 outs times 2 is about 8%, so fold\.$/)
  })
})
