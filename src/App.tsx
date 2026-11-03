import { useState } from 'react'
import { ScoreCard } from './drills/scoreCard'
import { NameTheHandDrill } from './ui/NameTheHandDrill'
import { RankingsChart } from './ui/RankingsChart'
import { RulesQuizDrill } from './ui/RulesQuizDrill'
import { ScorePanel } from './ui/ScorePanel'
import { WhoWinsDrill } from './ui/WhoWinsDrill'

const VIEWS = ['Who Wins?', 'Name the Hand', 'Rules Quiz', 'Rankings'] as const
type View = (typeof VIEWS)[number]

export default function App() {
  const [view, setView] = useState<View>('Who Wins?')
  const [score, setScore] = useState(() => new ScoreCard())

  const recordAnswer = (topic: string, correct: boolean) => {
    setScore((current) => current.record(topic, correct))
  }

  return (
    <main className="app">
      <header>
        <h1>Poker Trainer</h1>
        <nav aria-label="Views">
          {VIEWS.map((name) => (
            <button
              type="button"
              key={name}
              aria-current={view === name ? 'page' : undefined}
              onClick={() => setView(name)}
            >
              {name}
            </button>
          ))}
        </nav>
      </header>

      {view === 'Who Wins?' && <WhoWinsDrill onAnswered={recordAnswer} />}
      {view === 'Name the Hand' && <NameTheHandDrill onAnswered={recordAnswer} />}
      {view === 'Rules Quiz' && <RulesQuizDrill onAnswered={recordAnswer} />}
      {view === 'Rankings' && <RankingsChart />}

      <ScorePanel score={score} />
    </main>
  )
}
