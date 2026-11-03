import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { cards } from '../domain/card'
import { evaluateBestHand } from '../domain/hand'
import type { NameTheHandRound } from '../drills/nameTheHand'
import { NameTheHandDrill } from './NameTheHandDrill'

function round(board: string, holeCards: string): NameTheHandRound {
  const hand = evaluateBestHand(cards(`${board} ${holeCards}`))
  return { board: cards(board), holeCards: cards(holeCards), hand }
}

const flushRound = round('Ah Jh 9h 3d 4c', '7h 2h')
const option = (name: string) => screen.getByRole('button', { name })

describe('NameTheHandDrill', () => {
  it('offers all ten hand categories', () => {
    render(<NameTheHandDrill deal={() => flushRound} onAnswered={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(10)
  })

  it('confirms the right category and describes the hand', async () => {
    const user = userEvent.setup()
    render(<NameTheHandDrill deal={() => flushRound} onAnswered={() => {}} />)

    await user.click(option('Flush'))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText('Best hand: a flush, A J 9 7 2.')).toBeInTheDocument()
  })

  it('corrects the wrong category', async () => {
    const user = userEvent.setup()
    render(<NameTheHandDrill deal={() => flushRound} onAnswered={() => {}} />)

    await user.click(option('Straight'))

    expect(screen.getByText('Not quite.')).toBeInTheDocument()
  })

  it('reports each answer under the hand it really was', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<NameTheHandDrill deal={() => flushRound} onAnswered={onAnswered} />)

    await user.click(option('Pair'))

    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Flush', false)
  })

  it('freezes the options after the answer, then moves on', async () => {
    const user = userEvent.setup()
    render(<NameTheHandDrill deal={() => flushRound} onAnswered={() => {}} />)

    await user.click(option('Flush'))
    expect(option('Pair')).toBeDisabled()

    await user.click(option('Next hand'))
    expect(option('Pair')).toBeEnabled()
  })

  it('offers the results instead of another hand on the last round', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<NameTheHandDrill deal={() => flushRound} onAnswered={() => {}} isLastRound onFinish={onFinish} />)

    await user.click(option('Flush'))
    await user.click(screen.getByRole('button', { name: 'See results' }))

    expect(onFinish).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Next hand' })).not.toBeInTheDocument()
  })
})
