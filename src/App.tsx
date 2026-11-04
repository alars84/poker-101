import { useEffect, useState, type ComponentType } from 'react'
import { HOW_TO_SECTIONS } from './howTo/sections'
import { challengeFor, dateKey, type DailyChallenge } from './quizzes/dailyChallenge'
import { PracticeRun } from './quizzes/practiceRun'
import { GROUP_TITLES, type GroupTitle, type QuizId, type RunQuizId } from './quizzes/quizCatalog'
import { loadProgress, saveProgress } from './quizzes/savedProgress'
import { BestPossibleHandQuiz } from './ui/BestPossibleHandQuiz'
import { DailyQuiz } from './ui/DailyQuiz'
import { Home, type HomeQuizGroup } from './ui/Home'
import { HowToIndex, HowToSectionView } from './ui/HowTo'
import { NameTheHandQuiz } from './ui/NameTheHandQuiz'
import { OpenOrFoldQuiz } from './ui/OpenOrFoldQuiz'
import { OutsAndOddsQuiz } from './ui/OutsAndOddsQuiz'
import { RankTheHandsQuiz } from './ui/RankTheHandsQuiz'
import { ReadThePlayerQuiz } from './ui/ReadThePlayerQuiz'
import { RulesQuiz } from './ui/RulesQuiz'
import { RunScreen, type RunControls } from './ui/RunScreen'
import { ShareResult } from './ui/ShareResult'
import { WhoWinsQuiz } from './ui/WhoWinsQuiz'

type QuizListing = {
  id: QuizId
  group: GroupTitle
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

type View = 'home' | QuizId | 'daily' | 'how-to' | `how-to/${string}`

const sectionView = (id: string): View => `how-to/${id}`

// The URL holds the view so the browser back button returns home, not out of the app.
function viewFromUrl(): View {
  const hash = window.location.hash.slice(1)
  if (hash === 'rankings' || hash === 'daily' || hash === 'how-to') return hash
  const section = HOW_TO_SECTIONS.find(({ id }) => sectionView(id) === hash)
  if (section) return sectionView(section.id)
  return QUIZZES.find((quiz) => quiz.id === hash)?.id ?? 'home'
}

const shareUrl = () => `${window.location.origin}${window.location.pathname}#daily`

export default function App() {
  const [view, setView] = useState(viewFromUrl)
  const [{ score, runs, daily: savedDaily }, setProgress] = useState(loadProgress)
  const [today, setToday] = useState(() => dateKey(new Date()))
  const daily = challengeFor(savedDaily, today)
  const dailyTitle = QUIZZES.find(({ id }) => id === daily.quiz)?.title ?? ''

  useEffect(() => {
    const syncWithUrl = () => setView(viewFromUrl())
    window.addEventListener('hashchange', syncWithUrl)
    return () => window.removeEventListener('hashchange', syncWithUrl)
  }, [])

  // Phones keep tabs open for days, so a returning player may be on a new day.
  useEffect(() => {
    const syncWithClock = () => setToday(dateKey(new Date()))
    document.addEventListener('visibilitychange', syncWithClock)
    return () => document.removeEventListener('visibilitychange', syncWithClock)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  useEffect(() => {
    saveProgress({ score, runs, daily: savedDaily })
  }, [score, runs, savedDaily])

  const goTo = (next: View) => {
    setView(next)
    window.location.hash = next === 'home' ? '' : next
  }

  const updateRun = (id: RunQuizId, change: (run: PracticeRun) => PracticeRun) => {
    setProgress((current) => ({ ...current, runs: { ...current.runs, [id]: change(current.runs[id]) } }))
  }

  const updateDaily = (change: (challenge: DailyChallenge) => DailyChallenge) => {
    setProgress((current) => ({ ...current, daily: change(challengeFor(current.daily, today)) }))
  }

  const recordScore = (topic: string, correct: boolean) => {
    setProgress((current) => ({ ...current, score: current.score.record(topic, correct) }))
  }

  const openQuiz = (id: QuizId) => {
    if (id !== 'rankings' && runs[id].status === 'finished') updateRun(id, () => new PracticeRun())
    goTo(id)
  }

  const openSection = (id: string) => goTo(sectionView(id))
  const openedSection = HOW_TO_SECTIONS.find(({ id }) => sectionView(id) === view)

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
        <Home
          groups={homeGroups}
          score={score}
          onOpenQuiz={openQuiz}
          onOpenHowTo={() => goTo('how-to')}
          daily={daily}
          dailyTitle={dailyTitle}
          onOpenDaily={() => goTo('daily')}
        />
      )}

      {/* Hidden rather than unmounted, so leaving a quiz keeps the hand on the table. */}
      {QUIZZES.map(({ id, title, Quiz }) => (
        <div key={id} hidden={view !== id}>
          <RunScreen
            title={title}
            run={runs[id]}
            onAnswered={(topic, correct) => {
              updateRun(id, (run) => run.record(topic, correct))
              recordScore(topic, correct)
            }}
            onFinish={() => updateRun(id, (run) => run.finish())}
            onRestart={() => updateRun(id, () => new PracticeRun())}
            onExit={() => goTo('home')}
            onOpenSection={openSection}
          >
            {(controls) => <Quiz {...controls} />}
          </RunScreen>
        </div>
      ))}

      {view === 'daily' && (
        <RunScreen
          title={`Daily Challenge: ${dailyTitle}`}
          run={daily.run}
          onAnswered={(topic, correct) => {
            updateDaily((challenge) => challenge.record(topic, correct))
            recordScore(topic, correct)
          }}
          onFinish={() => updateDaily((challenge) => challenge.finish())}
          onExit={() => goTo('home')}
          onOpenSection={openSection}
          summaryExtra={<ShareResult text={daily.shareText(dailyTitle, shareUrl())} />}
        >
          {(controls) => <DailyQuiz challenge={daily} {...controls} />}
        </RunScreen>
      )}

      {view === 'how-to' && <HowToIndex onOpenSection={openSection} onExit={() => goTo('home')} />}

      {openedSection && (
        <HowToSectionView section={openedSection} onPractice={openQuiz} onExit={() => goTo('how-to')} />
      )}

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
