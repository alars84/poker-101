import { HAND_CATEGORIES } from '../domain/hand'
import { seededRng } from '../testing/seededRng'
import { countInRightSpot, isInRightSpot, moveHand, shuffledHands, STRONGEST_FIRST } from './rankTheHands'

describe('rank the hands', () => {
  it('counts a royal flush as strongest and high card as weakest', () => {
    expect(STRONGEST_FIRST[0]).toBe('royal flush')
    expect(STRONGEST_FIRST[9]).toBe('high card')
  })

  it('deals all ten hands', () => {
    expect([...shuffledHands(seededRng(1))].sort()).toEqual([...HAND_CATEGORIES].sort())
  })

  it('never deals the list already solved', () => {
    // Always picking the top of the remaining range makes Fisher-Yates leave the list as it was.
    const leavesEverythingInPlace = () => 0.999999
    const order = shuffledHands(leavesEverythingInPlace)
    expect(order).not.toEqual(STRONGEST_FIRST)
    expect([...order].sort()).toEqual([...HAND_CATEGORIES].sort())
  })

  it('moves a hand down, sliding the hands in between up', () => {
    expect(moveHand(['flush', 'pair', 'straight'], 0, 2)).toEqual(['pair', 'straight', 'flush'])
  })

  it('moves a hand up, sliding the hands in between down', () => {
    expect(moveHand(['flush', 'pair', 'straight'], 2, 0)).toEqual(['straight', 'flush', 'pair'])
  })

  it('keeps a hand on the list when it is moved past either end', () => {
    expect(moveHand(['flush', 'pair'], 0, -1)).toEqual(['flush', 'pair'])
    expect(moveHand(['flush', 'pair'], 1, 2)).toEqual(['flush', 'pair'])
  })

  it('judges each hand by its own spot, so one misplaced hand can throw off others', () => {
    const order = moveHand(STRONGEST_FIRST, 0, 2)
    expect(isInRightSpot(order, 0)).toBe(false)
    expect(isInRightSpot(order, 3)).toBe(true)
    expect(countInRightSpot(order)).toBe(7)
  })

  it('counts all ten when the order is solved', () => {
    expect(countInRightSpot(STRONGEST_FIRST)).toBe(10)
  })
})
