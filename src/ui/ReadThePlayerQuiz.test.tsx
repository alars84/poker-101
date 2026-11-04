import { render, screen } from '@testing-library/react'
import { ReadThePlayerQuiz } from './ReadThePlayerQuiz'

describe('ReadThePlayerQuiz', () => {
  it('says these are tendencies, not rules', () => {
    render(<ReadThePlayerQuiz onAnswered={() => {}} />)
    expect(screen.getByText(/tendencies, not rules/i)).toBeInTheDocument()
  })

  it('asks a question from the player bank', () => {
    render(<ReadThePlayerQuiz onAnswered={() => {}} />)
    expect(screen.getByText(/^(Player types|Adjusting|Reading the betting)$/)).toBeInTheDocument()
  })
})
