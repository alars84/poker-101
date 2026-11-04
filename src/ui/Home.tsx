import { RUN_LENGTH, type PracticeRun } from '../quizzes/practiceRun'
import type { ScoreCard } from '../quizzes/scoreCard'
import { ScorePanel } from './ScorePanel'

export type RunQuizId =
  | 'who-wins'
  | 'name-the-hand'
  | 'rules-quiz'
  | 'open-or-fold'
  | 'best-possible-hand'
  | 'outs-and-odds'
  | 'read-the-player'

export type QuizId = RunQuizId | 'rankings'

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
}

export function Home({ groups, score, onOpenQuiz }: Props) {
  return (
    <div className="home">
      <h1>Poker 101</h1>
      <section className="home-pitch">
        <h2>Want to practice your poker skills?</h2>
        <p>Pick a quiz. Most are {RUN_LENGTH} rounds, then you'll see what to work on.</p>
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
