import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { vi } from 'vitest'
import { PracticeRun } from '../quizzes/practiceRun'
import { RunScreen, type RunControls } from './RunScreen'

/** Stands in for a quiz: one button per kind of answer, then a next button. */
function FakeQuiz({ onAnswered, isLastRound, onFinish }: RunControls) {
  const [answered, setAnswered] = useState(false)
  const answer = (topic: string, correct: boolean) => {
    onAnswered(topic, correct)
    setAnswered(true)
  }
  if (answered) {
    return isLastRound ? (
      <button onClick={onFinish}>See results</button>
    ) : (
      <button onClick={() => setAnswered(false)}>Next</button>
    )
  }
  return (
    <>
      <button onClick={() => answer('Kicker', true)}>Right</button>
      <button onClick={() => answer('Kicker', false)}>Wrong kicker</button>
      <button onClick={() => answer('Split pot', false)}>Wrong split</button>
    </>
  )
}

/** Holds the run the way App does. */
function Harness({ onAnswered, onExit }: { onAnswered: RunControls['onAnswered']; onExit: () => void }) {
  const [run, setRun] = useState(() => new PracticeRun())
  return (
    <RunScreen
      title="Fake Quiz"
      run={run}
      onAnswered={(topic, correct) => {
        setRun(run.record(topic, correct))
        onAnswered(topic, correct)
      }}
      onFinish={() => setRun(run.finish())}
      onRestart={() => setRun(new PracticeRun())}
      onExit={onExit}
    >
      {(controls) => <FakeQuiz {...controls} />}
    </RunScreen>
  )
}

function renderRun(onAnswered: RunControls['onAnswered'] = () => {}, onExit = () => {}) {
  render(<Harness onAnswered={onAnswered} onExit={onExit} />)
  return userEvent.setup()
}

const click = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole('button', { name }))

async function answerRounds(user: ReturnType<typeof userEvent.setup>, answers: string[]) {
  for (const [i, answer] of answers.entries()) {
    await click(user, answer)
    if (i < 9 && i < answers.length - 1) await click(user, 'Next')
  }
}

const perfectRun = Array<string>(10).fill('Right')

describe('PracticeRun progress', () => {
  it('starts at zero of ten', () => {
    renderRun()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '10')
    expect(screen.getByText('0 of 10 answered')).toBeInTheDocument()
  })

  it('moves forward with each answer and keeps a correct count', async () => {
    const user = renderRun()
    await answerRounds(user, ['Right', 'Wrong kicker', 'Right'])
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
    expect(screen.getByText('3 of 10 answered')).toBeInTheDocument()
    expect(screen.getByText('2 correct')).toBeInTheDocument()
  })

  it('names the quiz and offers a way out', async () => {
    const onExit = vi.fn()
    const user = renderRun(() => {}, onExit)
    expect(screen.getByRole('heading', { name: 'Fake Quiz' })).toBeInTheDocument()

    await click(user, 'Exit')

    expect(onExit).toHaveBeenCalledOnce()
  })

  it('passes every answer up to the caller', async () => {
    const onAnswered = vi.fn()
    const user = renderRun(onAnswered)
    await click(user, 'Wrong split')
    expect(onAnswered).toHaveBeenCalledExactlyOnceWith('Split pot', false)
  })
})

describe('the end of a run', () => {
  it('keeps playing until the tenth answer', async () => {
    const user = renderRun()
    await answerRounds(user, Array<string>(9).fill('Right'))
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('offers the results after the tenth answer, so its feedback can be read first', async () => {
    const user = renderRun()
    await answerRounds(user, perfectRun)
    expect(screen.getByRole('button', { name: 'See results' })).toBeInTheDocument()
    expect(screen.queryByText(/of 10 correct/)).not.toBeInTheDocument()
  })

  it('shows the final score', async () => {
    const user = renderRun()
    await answerRounds(user, [...Array<string>(7).fill('Right'), ...Array<string>(3).fill('Wrong kicker')])
    await click(user, 'See results')
    expect(screen.getByRole('heading', { name: '7 of 10 correct' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('lists what tripped you up, worst first, with how often and a tip', async () => {
    const user = renderRun()
    await answerRounds(user, [
      ...Array<string>(6).fill('Right'),
      'Wrong split',
      'Wrong split',
      'Wrong kicker',
      'Right',
    ])
    await click(user, 'See results')

    const items = within(screen.getByRole('list', { name: 'Practice more' })).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Split pot')
    expect(items[0]).toHaveTextContent('Missed 2 of 2')
    expect(items[0]).toHaveTextContent('suits')
    expect(items[1]).toHaveTextContent('Kicker')
    expect(items[1]).toHaveTextContent('Missed 1 of 8')
  })

  it('says so when nothing was missed', async () => {
    const user = renderRun()
    await answerRounds(user, perfectRun)
    await click(user, 'See results')
    expect(screen.getByText(/Nothing tripped you up/)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('offers a way back home', async () => {
    const onExit = vi.fn()
    const user = renderRun(() => {}, onExit)
    await answerRounds(user, perfectRun)
    await click(user, 'See results')

    await click(user, 'Back to home')

    expect(onExit).toHaveBeenCalledOnce()
  })

  it('starts a clean run when asked', async () => {
    const user = renderRun()
    await answerRounds(user, perfectRun)
    await click(user, 'See results')
    await click(user, 'Practice again')
    expect(screen.getByText('0 of 10 answered')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Right' })).toBeInTheDocument()
  })
})
