import { useEffect, type ReactNode } from 'react'
import { sectionForTopic } from '../howTo/sections'
import { PRACTICE_TIPS, RUN_LENGTH } from '../quizzes/practiceRun'
import type { ScoreCard } from '../quizzes/scoreCard'

type Props = {
  score: ScoreCard
  /** Left out for a run that can only be played once. */
  onRestart?: () => void
  onExit: () => void
  onOpenSection: (id: string) => void
  extra?: ReactNode
}

export function RunSummary({ score, onRestart, onExit, onOpenSection, extra }: Props) {
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
            {missed.map(({ topic, correct, attempts }, i) => {
              const section = sectionForTopic(topic)
              const isFirstForSection =
                section && !missed.slice(0, i).some((earlier) => sectionForTopic(earlier.topic) === section)
              return (
                <li key={topic}>
                  <div className="summary-topic">
                    <strong>{topic}</strong>
                    <span>
                      Missed {attempts - correct} of {attempts}
                    </span>
                  </div>
                  <p>{PRACTICE_TIPS[topic]}</p>
                  {isFirstForSection && (
                    <button type="button" className="link-button" onClick={() => onOpenSection(section.id)}>
                      Read up: {section.title}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

      {extra}

      {onRestart && (
        <button type="button" className="primary" onClick={onRestart}>
          Practice again
        </button>
      )}
      <button type="button" className="link-button" onClick={onExit}>
        Back to home
      </button>
    </section>
  )
}
