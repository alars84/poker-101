import { useEffect, useState, type ComponentType } from 'react'
import { PracticeRun } from './quizzes/practiceRun'
import { ScoreCard } from './quizzes/scoreCard'
import { BestPossibleHandQuiz } from './ui/BestPossibleHandQuiz'
import { Home, type HomeQuizGroup, type QuizId, type RunQuizId } from './ui/Home'
import { NameTheHandQuiz } from './ui/NameTheHandQuiz'
import { OpenOrFoldQuiz } from './ui/OpenOrFoldQuiz'
import { OutsAndOddsQuiz } from './ui/OutsAndOddsQuiz'
import { RankTheHandsQuiz } from './ui/RankTheHandsQuiz'
import { ReadThePlayerQuiz } from './ui/ReadThePlayerQuiz'
import { RulesQuiz } from './ui/RulesQuiz'
import { RunScreen, type RunControls } from './ui/RunScreen'
import { WhoWinsQuiz } from './ui/WhoWinsQuiz'

const GROUP_TITLES = ['Know the game', 'Read the cards', 'Make the play'] as const

type QuizListing = {
  id: QuizId
  group: (typeof GROUP_TITLES)[number]
  title: string
  description: string
}

const [KNOW_THE_GAME, READ_THE_CARDS, MAKE_THE_PLAY] = GROUP_TITLES

const RANKINGS_QUIZ: QuizListing = {
  id: 'rankings',
  group: KNOW_THE_GAME,
  title: 'Hand Rankings Quiz',
  description: 'Drag the ten hands into order, strongest first.',
}

const QUIZZES: (QuizListing & { id: RunQuizId; Quiz: ComponentType<RunControls> })[] = [
  {
    id: 'rules-quiz',
    group: KNOW_THE_GAME,
    title: 'Rules Quiz',
    description: 'Blinds, betting, side pots, and who shows first.',
    Quiz: RulesQuiz,
  },
  {
    id: 'name-the-hand',
    group: READ_THE_CARDS,
    title: 'Name the Hand',
    description: 'Find the best five cards and name the hand.',
    Quiz: NameTheHandQuiz,
  },
  {
    id: 'who-wins',
    group: READ_THE_CARDS,
    title: 'Who Wins?',
    description: 'Read the showdown and pick the winner, including kickers and split pots.',
    Quiz: WhoWinsQuiz,
  },
  {
    id: 'best-possible-hand',
    group: READ_THE_CARDS,
    title: 'Best Possible Hand',
    description: 'Read the board and find the strongest hand anyone could have.',
    Quiz: BestPossibleHandQuiz,
  },
  {
    id: 'open-or-fold',
    group: MAKE_THE_PLAY,
    title: 'Open or Fold',
    description: 'Decide which starting hands to raise from each seat.',
    Quiz: OpenOrFoldQuiz,
  },
  {
    id: 'outs-and-odds',
    group: MAKE_THE_PLAY,
    title: 'Outs and Odds',
    description: 'Count your outs, then decide if the price is right.',
    Quiz: OutsAndOddsQuiz,
  },
  {
    id: 'read-the-player',
    group: MAKE_THE_PLAY,
    title: 'Read the Player',
    description: 'Spot player types, adjust to them, and read what their bets usually mean.',
    Quiz: ReadThePlayerQuiz,
  },
]

type View = 'home' | QuizId

// The URL holds the view so the browser back button returns home, not out of the app.
function viewFromUrl(): View {
  const hash = window.location.hash.slice(1)
  if (hash === 'rankings') return 'rankings'
  return QUIZZES.find((quiz) => quiz.id === hash)?.id ?? 'home'
}

export default function App() {
  const [view, setView] = useState(viewFromUrl)
  const [score, setScore] = useState(() => new ScoreCard())
  const [runs, setRuns] = useState<Record<RunQuizId, PracticeRun>>(() => ({
    'who-wins': new PracticeRun(),
    'name-the-hand': new PracticeRun(),
    'rules-quiz': new PracticeRun(),
    'open-or-fold': new PracticeRun(),
    'best-possible-hand': new PracticeRun(),
    'outs-and-odds': new PracticeRun(),
    'read-the-player': new PracticeRun(),
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

  const updateRun = (id: RunQuizId, change: (run: PracticeRun) => PracticeRun) => {
    setRuns((current) => ({ ...current, [id]: change(current[id]) }))
  }

  const openQuiz = (id: QuizId) => {
    if (id !== 'rankings' && runs[id].status === 'finished') updateRun(id, () => new PracticeRun())
    goTo(id)
  }

  const homeGroups: HomeQuizGroup[] = GROUP_TITLES.map((title) => ({
    title,
    quizzes: [RANKINGS_QUIZ, ...QUIZZES]
      .filter((quiz) => quiz.group === title)
      .map(({ id, title, description }) => ({
        id,
        title,
        description,
        run: id === 'rankings' ? undefined : runs[id],
      })),
  }))

  return (
    <main className="app">
      {view === 'home' && (
        <Home groups={homeGroups} score={score} onOpenQuiz={openQuiz} />
      )}

      {/* Hidden rather than unmounted, so leaving a quiz keeps the hand on the table. */}
      {QUIZZES.map(({ id, title, Quiz }) => (
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
            {(controls) => <Quiz {...controls} />}
          </RunScreen>
        </div>
      ))}

      {view === 'rankings' && (
        <>
          <div className="run-header">
            <h1>{RANKINGS_QUIZ.title}</h1>
            <button type="button" className="link-button" onClick={() => goTo('home')}>
              Back to home
            </button>
          </div>
          <RankTheHandsQuiz />
        </>
      )}
    </main>
  )
}
