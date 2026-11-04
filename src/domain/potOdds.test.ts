import { chanceToHit, priceToCall } from './potOdds'

describe('priceToCall', () => {
  it('is your call as a share of the final pot', () => {
    expect(priceToCall(80, 20)).toBeCloseTo(0.2)
    expect(priceToCall(60, 20)).toBeCloseTo(0.25)
  })
})

describe('chanceToHit', () => {
  it('is your outs as a share of the unseen cards', () => {
    expect(chanceToHit(9, 46)).toBeCloseTo(0.196, 3)
  })
})
