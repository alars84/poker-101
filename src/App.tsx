import { useEffect, useState, type ComponentType } from 'react'
import { PracticeRun } from './drills/practiceRun'
import { ScoreCard } from './drills/scoreCard'
import { Home, type DrillId } from './ui/Home'
import { NameTheHandDrill } from './ui/NameTheHandDrill'
import { RankingsChart } from './ui/RankingsChart'
import { RulesQuizDrill } from './ui/RulesQuizDrill'
import { RunScreen, type RunControls } from './ui/RunScreen'
import { WhoWinsDrill } from './ui/WhoWinsDrill'

const DRILLS: { id: DrillId; title: string; description: string; Drill: ComponentType<RunControls> }[] = [
  {
    id: 'who-wins',
    title: 'Who Wins?',
    description: 'Read the showdown and pick the winner, including kickers and split pots.',
    Drill: WhoWinsDrill,
  },
  {
    id: 'name-the-hand',
    title: 'Name the Hand',
    description: 'Find the best five cards and name the hand.',
    Drill: NameTheHandDrill,
  },
  {
    id: 'rules-quiz',
    title: 'Rules Quiz',
    description: 'Blinds, betting, side pots, and who shows first.',
    Drill: RulesQuizDrill,
  },
]

type View = 'home' | 'rankings' | DrillId

// The URL holds the view so the browser back button returns home, not out of the app.
function viewFromUrl(): View {
  const hash = window.location.hash.slice(1)
  if (hash === 'rankings') return 'rankings'
  return DRILLS.find((drill) => drill.id === hash)?.id ?? 'home'
}

export default function App() {
  const [view, setView] = useState(viewFromUrl)
  const [score, setScore] = useState(() => new ScoreCard())
  const [runs, setRuns] = useState<Record<DrillId, PracticeRun>>(() => ({
    'who-wins': new PracticeRun(),
    'name-the-hand': new PracticeRun(),
    'rules-quiz': new PracticeRun(),
  }))

  useEffect(() => {
    const syncWithUrl = () => setView(viewFromUrl())
    window.addEventListener('hashchange', syncWithUrl)
    return () => window.removeEventListener('hashchange', syncWithUrl)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  const goTo = (next: View) => {
    setView(next)
    window.location.hash = next === 'home' ? '' : next
  }

  const updateRun = (id: DrillId, change: (run: PracticeRun) => PracticeRun) => {
    setRuns((current) => ({ ...current, [id]: change(current[id]) }))
  }

  const openDrill = (id: DrillId) => {
    if (runs[id].status === 'finished') updateRun(id, () => new PracticeRun())
    goTo(id)
  }

  return (
    <main className="app">
      {view === 'home' && (
        <Home
          drills={DRILLS.map(({ id, title, description }) => ({ id, title, description, run: runs[id] }))}
          score={score}
          onOpenDrill={openDrill}
          onOpenRankings={() => goTo('rankings')}
        />
      )}

      {/* Hidden rather than unmounted, so leaving a drill keeps the hand on the table. */}
      {DRILLS.map(({ id, title, Drill }) => (
        <div key={id} hidden={view !== id}>
          <RunScreen
            title={title}
            run={runs[id]}
            onAnswered={(topic, correct) => {
              updateRun(id, (run) => run.record(topic, correct))
              setScore((current) => current.record(topic, correct))
            }}
            onFinish={() => updateRun(id, (run) => run.finish())}
            onRestart={() => updateRun(id, () => new PracticeRun())}
            onExit={() => goTo('home')}
          >
            {(controls) => <Drill {...controls} />}
          </RunScreen>
        </div>
      ))}

      {view === 'rankings' && (
        <>
          <div className="run-header">
            <h1>Hand Rankings</h1>
            <button type="button" className="link-button" onClick={() => goTo('home')}>
              Back to home
            </button>
          </div>
          <RankingsChart />
        </>
      )}
    </main>
  )
}
