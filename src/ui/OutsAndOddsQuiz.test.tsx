import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { cards } from '../domain/card'
import type { OutsRound } from '../quizzes/outsAndOdds'
import { OutsAndOddsQuiz } from './OutsAndOddsQuiz'

const round: OutsRound = {
  topic: 'Counting outs',
  prompt: 'How many cards make you a straight or better?',
  board: cards('Ts Qh 2c'),
  holeCards: cards('8c 9d'),
  outs: cards('Js Jh Jd Jc'),
  options: [
    { label: '4', correct: true },
    { label: '8', correct: false },
    { label: '9', correct: false },
    { label: '12', correct: false },
  ],
  explanation: 'You have 4 outs.',
}

const button = (name: string) => screen.getByRole('button', { name })

describe('OutsAndOddsQuiz', () => {
  it('shows the board, your cards, and the question, with your outs hidden', () => {
    render(<OutsAndOddsQuiz deal={() => round} onAnswered={() => {}} />)
    expect(screen.getByText(round.prompt)).toBeInTheDocument()
    expect(within(screen.getByLabelText('Board')).getAllByRole('img')).toHaveLength(3)
    expect(within(screen.getByLabelText('Your hole cards')).getAllByRole('img')).toHaveLength(2)
    expect(screen.queryByLabelText('Your outs')).not.toBeInTheDocument()
  })

  it('confirms the answer, shows the outs, and reports under the topic', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<OutsAndOddsQuiz deal={() => round} onAnswered={onAnswered} />)

    await user.click(button('4'))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText(round.explanation)).toBeInTheDocument()
    expect(within(screen.getByLabelText('Your outs')).getAllByRole('img')).toHaveLength(4)
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Counting outs', true)
  })

  it('corrects a wrong answer and freezes the options', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<OutsAndOddsQuiz deal={() => round} onAnswered={onAnswered} />)

    await user.click(button('9'))

    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(button('4')).toBeDisabled()
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Counting outs', false)
  })

  it('moves on to the next hand', async () => {
    const user = userEvent.setup()
    const next = { ...round, prompt: 'Call or fold?' }
    const deal = vi.fn().mockReturnValueOnce(round).mockReturnValue(next)
    render(<OutsAndOddsQuiz deal={deal} onAnswered={() => {}} />)

    await user.click(button('4'))
    await user.click(button('Next hand'))

    expect(screen.getByText('Call or fold?')).toBeInTheDocument()
    expect(screen.queryByLabelText('Your outs')).not.toBeInTheDocument()
  })

  it('offers the results on the last round', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<OutsAndOddsQuiz deal={() => round} onAnswered={() => {}} isLastRound onFinish={onFinish} />)

    await user.click(button('4'))
    await user.click(button('See results'))

    expect(onFinish).toHaveBeenCalledOnce()
  })
})
