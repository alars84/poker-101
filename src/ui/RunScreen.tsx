import type { ReactNode } from 'react'
import { RUN_LENGTH, type PracticeRun } from '../drills/practiceRun'
import { RunSummary } from './RunSummary'

export type RunControls = {
  onAnswered: (topic: string, correct: boolean) => void
  isLastRound: boolean
  onFinish: () => void
}

type Props = {
  title: string
  run: PracticeRun
  onAnswered: (topic: string, correct: boolean) => void
  onFinish: () => void
  onRestart: () => void
  onExit: () => void
  children: (controls: RunControls) => ReactNode
}

export function RunScreen({ title, run, onAnswered, onFinish, onRestart, onExit, children }: Props) {
  const { answered, correct, isLastRound, status } = run
  return (
    <div className="run-screen">
      <div className="run-header">
        <h1>{title}</h1>
        {status !== 'finished' && (
          <button type="button" className="link-button" onClick={onExit}>
            Exit
          </button>
        )}
      </div>

      {status === 'finished' ? (
        <RunSummary score={run.score} onRestart={onRestart} onExit={onExit} />
      ) : (
        <>
          <div className="progress">
            <div className="progress-labels">
              <span>
                {answered} of {RUN_LENGTH} answered
              </span>
              <span>{correct} correct</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Run progress"
              aria-valuenow={answered}
              aria-valuemin={0}
              aria-valuemax={RUN_LENGTH}
            >
              <div className="progress-fill" style={{ width: `${(answered / RUN_LENGTH) * 100}%` }} />
            </div>
          </div>

          {children({ onAnswered, isLastRound, onFinish })}
        </>
      )}
    </div>
  )
}
