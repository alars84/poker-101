import type { ScoreCard } from '../quizzes/scoreCard'

export function ScorePanel({ score }: { score: ScoreCard }) {
  const { correct, attempts } = score.total()
  if (attempts === 0) return null
  return (
    <section className="score" aria-label="Your score">
      <h2>
        Your score: {correct} of {attempts} correct
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
