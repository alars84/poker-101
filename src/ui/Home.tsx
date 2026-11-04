import type { DailyChallenge } from '../quizzes/dailyChallenge'
import { RUN_LENGTH, type PracticeRun } from '../quizzes/practiceRun'
import type { ScoreCard } from '../quizzes/scoreCard'
import type { QuizId } from '../quizzes/quizCatalog'
import { ScorePanel } from './ScorePanel'

export type HomeQuiz = {
  id: QuizId
  title: string
  description: string
  /** Left out for a quiz that isn't played in rounds. */
  run?: PracticeRun
}

export type HomeQuizGroup = {
  title: string
  quizzes: readonly HomeQuiz[]
}

type Props = {
  groups: readonly HomeQuizGroup[]
  score: ScoreCard
  onOpenQuiz: (id: QuizId) => void
  onOpenHowTo: () => void
  daily: DailyChallenge
  dailyTitle: string
  onOpenDaily: () => void
}

function dailyCardText({ run }: DailyChallenge, title: string): { action: string; description: string } {
  if (run.status === 'finished') {
    return { action: 'See result', description: `Today: ${title}. You got ${run.correct} of ${RUN_LENGTH}.` }
  }
  const action = run.status === 'in-progress' ? `Resume (${run.answered} of ${RUN_LENGTH})` : 'Start'
  return { action, description: `Today: ${title}. Same hands for everyone, one try.` }
}

export function Home({ groups, score, onOpenQuiz, onOpenHowTo, daily, dailyTitle, onOpenDaily }: Props) {
  const dailyCard = dailyCardText(daily, dailyTitle)
  return (
    <div className="home">
      <h1>Poker 101</h1>
      <section className="home-pitch">
        <h2>Want to practice your poker skills?</h2>
        <p>Pick a quiz. Most are {RUN_LENGTH} rounds, then you'll see what to work on.</p>
      </section>

      <section className="quiz-group" aria-label="Start here">
        <h2>Start here</h2>
        <div className="quiz-cards">
          <div className="quiz-card">
            <div className="quiz-card-text">
              <h3>Daily Challenge</h3>
              <p>{dailyCard.description}</p>
            </div>
            <button
              type="button"
              className="quiz-card-action"
              aria-label={`${dailyCard.action} Daily Challenge`}
              onClick={onOpenDaily}
            >
              {dailyCard.action}
            </button>
          </div>
          <div className="quiz-card">
            <div className="quiz-card-text">
              <h3>How To</h3>
              <p>Short cheat sheets on the rules, reading the cards, and making the play.</p>
            </div>
            <button type="button" className="quiz-card-action" aria-label="Open How To" onClick={onOpenHowTo}>
              Open
            </button>
          </div>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.title} className="quiz-group" aria-label={group.title}>
          <h2>{group.title}</h2>
          <div className="quiz-cards">
            {group.quizzes.map(({ id, title, description, run }) => {
              const action = run?.status === 'in-progress' ? `Resume (${run.answered} of ${RUN_LENGTH})` : 'Start'
              return (
                <div key={id} className="quiz-card">
                  <div className="quiz-card-text">
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <button
                    type="button"
                    className="quiz-card-action"
                    aria-label={`${action} ${title}`}
                    onClick={() => onOpenQuiz(id)}
                  >
                    {action}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <ScorePanel score={score} />
    </div>
  )
}
