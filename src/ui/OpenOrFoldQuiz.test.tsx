import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { cards } from '../domain/card'
import type { OpenOrFoldRound } from '../quizzes/openOrFold'
import { OpenOrFoldQuiz } from './OpenOrFoldQuiz'

const round: OpenOrFoldRound = { seat: 'late', holeCards: cards('Jh Td'), decision: 'raise' }
const button = (name: string) => screen.getByRole('button', { name })

describe('OpenOrFoldQuiz', () => {
  it('shows the seat and your cards', () => {
    render(<OpenOrFoldQuiz deal={() => round} onAnswered={() => {}} />)
    expect(screen.getByText(/folded to you in late position/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'J♥' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '10♦' })).toBeInTheDocument()
  })

  it('confirms the right decision, explains it, and reports it under the seat', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<OpenOrFoldQuiz deal={() => round} onAnswered={onAnswered} />)

    await user.click(button('Raise'))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText(/JTo \(offsuit\) opens from late position/)).toBeInTheDocument()
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Late position', true)
  })

  it('corrects the wrong decision and freezes the buttons', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<OpenOrFoldQuiz deal={() => round} onAnswered={onAnswered} />)

    await user.click(button('Fold'))

    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(button('Raise')).toBeDisabled()
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Late position', false)
  })

  it('deals the next hand', async () => {
    const user = userEvent.setup()
    const next: OpenOrFoldRound = { seat: 'early', holeCards: cards('7h 2d'), decision: 'fold' }
    const deal = vi.fn().mockReturnValueOnce(round).mockReturnValue(next)
    render(<OpenOrFoldQuiz deal={deal} onAnswered={() => {}} />)

    await user.click(button('Raise'))
    await user.click(button('Next hand'))

    expect(screen.getByText(/folded to you in early position/)).toBeInTheDocument()
    expect(button('Raise')).toBeEnabled()
  })

  it('offers the results on the last round', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<OpenOrFoldQuiz deal={() => round} onAnswered={() => {}} isLastRound onFinish={onFinish} />)

    await user.click(button('Raise'))
    await user.click(button('See results'))

    expect(onFinish).toHaveBeenCalledOnce()
  })
})
