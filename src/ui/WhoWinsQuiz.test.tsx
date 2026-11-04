import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { cards } from '../domain/card'
import { resolveShowdown } from '../domain/showdown'
import type { ShowdownRound } from '../quizzes/whoWins'
import { WhoWinsQuiz } from './WhoWinsQuiz'

function round(board: string, ...holeCards: string[]): ShowdownRound {
  const players = holeCards.map((hole, i) => ({ name: ['Ana', 'Ben', 'Cara'][i], holeCards: cards(hole) }))
  return { board: cards(board), players, result: resolveShowdown(cards(board), players) }
}

const kickerRound = round('Kh 9d 5c 3s 2h', 'Ks Ad', 'Kd Qc')
const splitRound = round('Kh 9d 5c 3s 2h', 'Ks Qd', 'Kd Qc', '7d 8c')

const seat = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) })
const lockIn = () => screen.getByRole('button', { name: 'Lock it in' })

describe('WhoWinsQuiz', () => {
  it('shows the board and every player before an answer', () => {
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} />)
    expect(screen.getAllByLabelText(/^[0-9JQKA]+[♠♥♦♣]$/)).toHaveLength(9)
    expect(seat('Ana')).toBeInTheDocument()
    expect(seat('Ben')).toBeInTheDocument()
  })

  it('needs a pick before locking in', () => {
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} />)
    expect(lockIn()).toBeDisabled()
  })

  it('confirms a right answer and explains it', async () => {
    const user = userEvent.setup()
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} />)

    await user.click(seat('Ana'))
    await user.click(lockIn())

    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText("Both have a pair of kings. Ana's ace kicker beats Ben's queen.")).toBeInTheDocument()
  })

  it('corrects a wrong answer', async () => {
    const user = userEvent.setup()
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} />)

    await user.click(seat('Ben'))
    await user.click(lockIn())

    expect(screen.getByText('Not quite.')).toBeInTheDocument()
  })

  it('takes several picks to call a split pot', async () => {
    const user = userEvent.setup()
    render(<WhoWinsQuiz deal={() => splitRound} onAnswered={() => {}} />)

    await user.click(seat('Ana'))
    await user.click(seat('Ben'))
    await user.click(lockIn())

    expect(screen.getByText('Correct!')).toBeInTheDocument()
  })

  it('lets a player be unpicked', async () => {
    const user = userEvent.setup()
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} />)

    await user.click(seat('Ben'))
    await user.click(seat('Ben'))

    expect(lockIn()).toBeDisabled()
  })

  it('reports the scenario and result once per answer', async () => {
    const user = userEvent.setup()
    const onAnswered = vi.fn()
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={onAnswered} />)

    await user.click(seat('Ana'))
    await user.click(lockIn())

    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Kicker', true)
  })

  it('shows each best hand after the answer', async () => {
    const user = userEvent.setup()
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} />)

    await user.click(seat('Ana'))
    await user.click(lockIn())

    expect(screen.getAllByText('a pair of kings')).toHaveLength(2)
  })

  it('freezes the seats after the answer', async () => {
    const user = userEvent.setup()
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} />)

    await user.click(seat('Ana'))
    await user.click(lockIn())

    expect(seat('Ben')).toBeDisabled()
  })

  it('moves on to a fresh hand', async () => {
    const user = userEvent.setup()
    const deal = vi.fn().mockReturnValueOnce(kickerRound).mockReturnValue(splitRound)
    render(<WhoWinsQuiz deal={deal} onAnswered={() => {}} />)

    await user.click(seat('Ana'))
    await user.click(lockIn())
    await user.click(screen.getByRole('button', { name: 'Next hand' }))

    expect(seat('Cara')).toBeEnabled()
    expect(screen.queryByText('Correct!')).not.toBeInTheDocument()
    expect(lockIn()).toBeDisabled()
  })

  it('offers the results instead of another hand on the last round', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<WhoWinsQuiz deal={() => kickerRound} onAnswered={() => {}} isLastRound onFinish={onFinish} />)

    await user.click(seat('Ana'))
    await user.click(lockIn())
    await user.click(screen.getByRole('button', { name: 'See results' }))

    expect(onFinish).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Next hand' })).not.toBeInTheDocument()
  })
})
