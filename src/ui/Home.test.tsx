import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { PracticeRun } from '../quizzes/practiceRun'
import { ScoreCard } from '../quizzes/scoreCard'
import { Home, type HomeQuiz, type HomeQuizGroup } from './Home'

const quiz = (run = new PracticeRun()): HomeQuiz => ({
  id: 'rules-quiz',
  title: 'Rules Quiz',
  description: 'Blinds and betting.',
  run,
})

const rankings: HomeQuiz = { id: 'rankings', title: 'Hand Rankings Quiz', description: 'Put the hands in order.' }

const groupOf = (...quizzes: HomeQuiz[]): HomeQuizGroup[] => [{ title: 'Know the game', quizzes }]

const renderHome = (overrides: Partial<Parameters<typeof Home>[0]> = {}) =>
  render(<Home groups={groupOf(quiz())} score={new ScoreCard()} onOpenQuiz={() => {}} {...overrides} />)

describe('Home', () => {
  it('carries the app name', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1, name: 'Poker 101' })).toBeInTheDocument()
  })

  it('invites you to practice and describes each quiz', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: 'Want to practice your poker skills?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rules Quiz' })).toBeInTheDocument()
    expect(screen.getByText('Blinds and betting.')).toBeInTheDocument()
  })

  it('starts a quiz', async () => {
    const user = userEvent.setup()
    const onOpenQuiz = vi.fn()
    renderHome({ onOpenQuiz })

    await user.click(screen.getByRole('button', { name: 'Start Rules Quiz' }))

    expect(onOpenQuiz).toHaveBeenCalledExactlyOnceWith('rules-quiz')
  })

  it('offers to resume a run in progress, and says how far along it is', () => {
    const run = new PracticeRun().record('Betting', true).record('Betting', false)
    renderHome({ groups: groupOf(quiz(run)) })
    expect(screen.getByRole('button', { name: 'Resume (2 of 10) Rules Quiz' })).toBeInTheDocument()
  })

  it('goes back to Start once a run is finished', () => {
    const run = new PracticeRun().record('Betting', true).finish()
    renderHome({ groups: groupOf(quiz(run)) })
    expect(screen.getByRole('button', { name: 'Start Rules Quiz' })).toBeInTheDocument()
  })

  it('lists each quiz under its group', () => {
    const groups: HomeQuizGroup[] = [
      { title: 'Know the game', quizzes: [rankings] },
      { title: 'Make the play', quizzes: [quiz()] },
    ]
    renderHome({ groups })

    const knowTheGame = within(screen.getByRole('region', { name: 'Know the game' }))
    expect(knowTheGame.getByRole('heading', { name: 'Hand Rankings Quiz' })).toBeInTheDocument()
    expect(knowTheGame.queryByRole('heading', { name: 'Rules Quiz' })).not.toBeInTheDocument()

    const makeThePlay = within(screen.getByRole('region', { name: 'Make the play' }))
    expect(makeThePlay.getByRole('heading', { name: 'Rules Quiz' })).toBeInTheDocument()
  })

  it('starts a quiz that has no rounds, like any other', async () => {
    const user = userEvent.setup()
    const onOpenQuiz = vi.fn()
    renderHome({ groups: groupOf(rankings), onOpenQuiz })

    await user.click(screen.getByRole('button', { name: 'Start Hand Rankings Quiz' }))

    expect(onOpenQuiz).toHaveBeenCalledExactlyOnceWith('rankings')
  })

  it('shows the session score once there is one', () => {
    renderHome({ score: new ScoreCard().record('Betting', true) })
    expect(screen.getByText('This session: 1 of 1 correct')).toBeInTheDocument()
  })
})
