import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { cards } from '../domain/card'
import { evaluateBestHand } from '../domain/hand'
import type { BestPossibleRound } from '../quizzes/bestPossibleHand'
import { BestPossibleHandQuiz } from './BestPossibleHandQuiz'

const board = cards('Kh Kd 7c 4s 2h')
const base = {
  board,
  holeCards: cards('Ks Kc'),
  hand: evaluateBestHand([...board, ...cards('Ks Kc')]),
}

const nameRound: BestPossibleRound = {
  ...base,
  prompt: 'What is the best possible hand on this board?',
  options: [
    { label: 'Full house', correct: false },
    { label: 'Four of a kind', correct: true },
    { label: 'Flush', correct: false },
    { label: 'Straight', correct: false },
  ],
}

const pickRound: BestPossibleRound = {
  ...base,
  prompt: 'Which hole cards make the best possible hand?',
  options: [
    { label: 'K♠ K♣', holeCards: cards('Ks Kc'), correct: true },
    { label: 'A♠ K♣', holeCards: cards('As Kc'), correct: false },
    { label: '7♠ 7♦', holeCards: cards('7s 7d'), correct: false },
    { label: '4♦ 4♣', holeCards: cards('4d 4c'), correct: false },
  ],
}

const button = (name: string) => screen.getByRole('button', { name })

describe('BestPossibleHandQuiz', () => {
  it('shows the board and the question', () => {
    render(<BestPossibleHandQuiz deal={() => nameRound} onAnswered={() => {}} />)
    expect(screen.getByText(nameRound.prompt)).toBeInTheDocument()
    expect(within(screen.getByLabelText('Board')).getAllByRole('img')).toHaveLength(5)
  })

  it('confirms the right category, explains it, and reports it under the texture', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<BestPossibleHandQuiz deal={() => nameRound} onAnswered={onAnswered} />)

    await user.click(button('Four of a kind'))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText(/A paired board makes four of a kind possible/)).toBeInTheDocument()
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Paired boards', true)
  })

  it('shows hole card options as cards', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<BestPossibleHandQuiz deal={() => pickRound} onAnswered={onAnswered} />)

    await user.click(button('A♠ K♣'))

    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(button('7♠ 7♦')).toBeDisabled()
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Paired boards', false)
  })

  it('moves on to the next board', async () => {
    const user = userEvent.setup()
    const deal = vi.fn().mockReturnValueOnce(nameRound).mockReturnValue(pickRound)
    render(<BestPossibleHandQuiz deal={deal} onAnswered={() => {}} />)

    await user.click(button('Flush'))
    await user.click(button('Next board'))

    expect(screen.getByText(pickRound.prompt)).toBeInTheDocument()
  })

  it('offers the results on the last round', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<BestPossibleHandQuiz deal={() => nameRound} onAnswered={() => {}} isLastRound onFinish={onFinish} />)

    await user.click(button('Flush'))
    await user.click(button('See results'))

    expect(onFinish).toHaveBeenCalledOnce()
  })
})
