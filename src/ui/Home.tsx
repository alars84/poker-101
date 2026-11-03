import { RUN_LENGTH, type PracticeRun } from '../drills/practiceRun'
import type { ScoreCard } from '../drills/scoreCard'
import { ScorePanel } from './ScorePanel'

export type DrillId = 'who-wins' | 'name-the-hand' | 'rules-quiz'

export type HomeDrill = {
  id: DrillId
  title: string
  description: string
  run: PracticeRun
}

type Props = {
  drills: readonly HomeDrill[]
  score: ScoreCard
  onOpenDrill: (id: DrillId) => void
  onOpenRankings: () => void
}

export function Home({ drills, score, onOpenDrill, onOpenRankings }: Props) {
  return (
    <div className="home">
      <h1>Poker 101</h1>
      <section className="home-pitch">
        <h2>Want to practice your poker skills?</h2>
        <p>Pick a drill. Each one is {RUN_LENGTH} rounds, then you'll see what to work on.</p>
      </section>

      <div className="drill-cards">
        {drills.map(({ id, title, description, run }) => {
          const action =
            run.status === 'in-progress' ? `Resume (${run.answered} of ${RUN_LENGTH})` : 'Start'
          return (
            <section key={id} className="drill-card">
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <button
                type="button"
                className="primary"
                aria-label={`${action} ${title}`}
                onClick={() => onOpenDrill(id)}
              >
                {action}
              </button>
            </section>
          )
        })}
      </div>

      <button type="button" className="link-button" onClick={onOpenRankings}>
        Hand rankings chart
      </button>

      <ScorePanel score={score} />
    </div>
  )
}
