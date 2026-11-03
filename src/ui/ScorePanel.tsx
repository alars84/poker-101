import type { ScoreCard } from '../drills/scoreCard'

export function ScorePanel({ score }: { score: ScoreCard }) {
  const { correct, attempts } = score.total()
  if (attempts === 0) return null
  return (
    <section className="score" aria-label="Session score">
      <h2>
        This session: {correct} of {attempts} correct
      </h2>
      <dl>
        {score.topics().map((topic) => (
          <div key={topic.topic}>
            <dt>{topic.topic}</dt>
            <dd>
              {topic.correct}/{topic.attempts}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
