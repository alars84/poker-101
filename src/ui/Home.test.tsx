import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { PracticeRun } from '../drills/practiceRun'
import { ScoreCard } from '../drills/scoreCard'
import { Home, type HomeDrill } from './Home'

const drill = (run = new PracticeRun()): HomeDrill => ({
  id: 'rules-quiz',
  title: 'Rules Quiz',
  description: 'Blinds and betting.',
  run,
})

const renderHome = (overrides: Partial<Parameters<typeof Home>[0]> = {}) =>
  render(
    <Home
      drills={[drill()]}
      score={new ScoreCard()}
      onOpenDrill={() => {}}
      onOpenRankings={() => {}}
      {...overrides}
    />,
  )

describe('Home', () => {
  it('carries the app name', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1, name: 'Poker 101' })).toBeInTheDocument()
  })

  it('invites you to practice and describes each drill', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: 'Want to practice your poker skills?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rules Quiz' })).toBeInTheDocument()
    expect(screen.getByText('Blinds and betting.')).toBeInTheDocument()
  })

  it('starts a drill', async () => {
    const user = userEvent.setup()
    const onOpenDrill = vi.fn()
    renderHome({ onOpenDrill })

    await user.click(screen.getByRole('button', { name: 'Start Rules Quiz' }))

    expect(onOpenDrill).toHaveBeenCalledExactlyOnceWith('rules-quiz')
  })

  it('offers to resume a run in progress, and says how far along it is', () => {
    const run = new PracticeRun().record('Betting', true).record('Betting', false)
    renderHome({ drills: [drill(run)] })
    expect(screen.getByRole('button', { name: 'Resume (2 of 10) Rules Quiz' })).toBeInTheDocument()
  })

  it('goes back to Start once a run is finished', () => {
    const run = new PracticeRun().record('Betting', true).finish()
    renderHome({ drills: [drill(run)] })
    expect(screen.getByRole('button', { name: 'Start Rules Quiz' })).toBeInTheDocument()
  })

  it('links to the rankings quiz', async () => {
    const user = userEvent.setup()
    const onOpenRankings = vi.fn()
    renderHome({ onOpenRankings })

    await user.click(screen.getByRole('button', { name: 'Hand rankings quiz' }))

    expect(onOpenRankings).toHaveBeenCalledOnce()
  })

  it('shows the session score once there is one', () => {
    renderHome({ score: new ScoreCard().record('Betting', true) })
    expect(screen.getByText('This session: 1 of 1 correct')).toBeInTheDocument()
  })
})
