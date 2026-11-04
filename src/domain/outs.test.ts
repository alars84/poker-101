import { cards } from './card'
import { findOuts } from './outs'

const outs = (holeCards: string, board: string) => findOuts(cards(holeCards), cards(board))

describe('findOuts', () => {
  it('counts 9 for a flush draw', () => {
    expect(outs('Ah Kh', '2h 7h 9c')).toHaveLength(9)
  })

  it('counts 8 for an open-ended straight draw', () => {
    expect(outs('8c 9d', 'Ts Jh 2c')).toHaveLength(8)
  })

  it('counts 4 for a gutshot', () => {
    expect(outs('8c 9d', 'Ts Qh 2c')).toHaveLength(4)
  })

  it('counts a card that completes both draws only once', () => {
    expect(outs('Th Jh', '9h 8h 2d')).toHaveLength(15)
  })

  it('finds the same outs on the turn', () => {
    expect(outs('Ah Kh', '2h 7h 9c 3d')).toHaveLength(9)
  })

  it('skips cards that only pair you', () => {
    expect(outs('Ah Kd', '2c 7d 9h')).toHaveLength(0)
  })

  it('skips a straight that sits on the board without your cards', () => {
    expect(outs('Ah Kd', '5c 6d 7h 8s')).toHaveLength(0)
  })
})
