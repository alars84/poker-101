import { useEffect } from 'react'
import { PRACTICE_TIPS, RUN_LENGTH } from '../drills/practiceRun'
import type { ScoreCard } from '../drills/scoreCard'

type Props = {
  score: ScoreCard
  onRestart: () => void
  onExit: () => void
}

export function RunSummary({ score, onRestart, onExit }: Props) {
  const missed = score.missedTopics()

  // See results sits low on a phone, and the score belongs at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section className="summary">
      <h2>
        {score.total().correct} of {RUN_LENGTH} correct
      </h2>

      {missed.length === 0 ? (
        <p>Nothing tripped you up this run.</p>
      ) : (
        <>
          <h3 id="practice-more">Practice more</h3>
          <ul aria-labelledby="practice-more">
            {missed.map(({ topic, correct, attempts }) => (
              <li key={topic}>
                <div className="summary-topic">
                  <strong>{topic}</strong>
                  <span>
                    Missed {attempts - correct} of {attempts}
                  </span>
                </div>
                <p>{PRACTICE_TIPS[topic]}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className="primary" onClick={onRestart}>
        Practice again
      </button>
      <button type="button" className="link-button" onClick={onExit}>
        Back to home
      </button>
    </section>
  )
}
