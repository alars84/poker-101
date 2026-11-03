import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { QuizRound } from '../drills/rulesQuiz'
import { RulesQuizDrill } from './RulesQuizDrill'

const round = (prompt: string): QuizRound => ({
  question: {
    topic: 'Betting',
    prompt,
    answer: 'Raise to $10',
    wrong: ['Raise to $8', 'Raise to $12'],
    explanation: 'The last raise was $4.',
  },
  options: ['Raise to $8', 'Raise to $10', 'Raise to $12'],
})

const option = (name: string) => screen.getByRole('button', { name })

describe('RulesQuizDrill', () => {
  it('shows the question, its topic, and its options', () => {
    render(<RulesQuizDrill deal={() => round('What is the minimum?')} onAnswered={() => {}} />)
    expect(screen.getByText('What is the minimum?')).toBeInTheDocument()
    expect(screen.getByText('Betting')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('confirms the right answer and explains it', async () => {
    const user = userEvent.setup()
    render(<RulesQuizDrill deal={() => round('What is the minimum?')} onAnswered={() => {}} />)

    await user.click(option('Raise to $10'))

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText('The last raise was $4.')).toBeInTheDocument()
  })

  it('corrects a wrong answer', async () => {
    const user = userEvent.setup()
    render(<RulesQuizDrill deal={() => round('What is the minimum?')} onAnswered={() => {}} />)

    await user.click(option('Raise to $8'))

    expect(screen.getByText('Not quite.')).toBeInTheDocument()
  })

  it('reports each answer under the question topic', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<RulesQuizDrill deal={() => round('What is the minimum?')} onAnswered={onAnswered} />)

    await user.click(option('Raise to $12'))

    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Betting', false)
  })

  it('freezes the options after the answer, then moves on', async () => {
    const user = userEvent.setup()
    const deal = vi.fn().mockReturnValueOnce(round('First?')).mockReturnValue(round('Second?'))
    render(<RulesQuizDrill deal={deal} onAnswered={() => {}} />)

    await user.click(option('Raise to $10'))
    expect(option('Raise to $8')).toBeDisabled()

    await user.click(option('Next question'))
    expect(screen.getByText('Second?')).toBeInTheDocument()
    expect(option('Raise to $8')).toBeEnabled()
  })
})
