import type { Rng } from '../domain/deck'
import { seededRng } from '../domain/seededRng'
import { PracticeRun, RUN_LENGTH } from './practiceRun'
import type { RunQuizId } from './quizCatalog'

/** Only the quizzes that deal fresh cards. A fixed question bank would soon be memorized. */
export const DAILY_QUIZZES = [
  'who-wins',
  'name-the-hand',
  'best-possible-hand',
  'open-or-fold',
  'outs-and-odds',
] as const satisfies readonly RunQuizId[]

export type DailyQuizId = (typeof DAILY_QUIZZES)[number]

const MS_PER_DAY = 86_400_000

/** The player's local date, so a new challenge arrives at their midnight. */
export function dateKey(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function quizForDate(date: string): DailyQuizId {
  const [year, month, day] = date.split('-').map(Number)
  const dayNumber = Date.UTC(year, month - 1, day) / MS_PER_DAY
  return DAILY_QUIZZES[dayNumber % DAILY_QUIZZES.length]
}

/**
 * Seeded by date and round alone, so a round deals the same cards for everyone,
 * however many times it gets dealt. React's StrictMode deals twice in development.
 */
export function dailyDeal(date: string, round: number): Rng {
  return seededRng(fnv1a(`${date}/${round}`))
}

/** Spreads similar text across all 32 bits, since close seeds give close first numbers. */
function fnv1a(text: string): number {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  }
  return hash >>> 0
}

/** Immutable, like PracticeRun: each change returns a new challenge for React state. */
export class DailyChallenge {
  readonly date: string
  readonly run: PracticeRun
  /** In play order. The run only keeps totals, and the share grid needs the order. */
  readonly outcomes: readonly boolean[]

  constructor(date: string, run: PracticeRun = new PracticeRun(), outcomes: readonly boolean[] = []) {
    this.date = date
    this.run = run
    this.outcomes = outcomes
  }

  get quiz(): DailyQuizId {
    return quizForDate(this.date)
  }

  /** The deal for the round being played, so leaving and coming back gives the same hand. */
  get currentDeal(): Rng {
    return dailyDeal(this.date, this.run.answered)
  }

  record(topic: string, correct: boolean): DailyChallenge {
    return new DailyChallenge(this.date, this.run.record(topic, correct), [...this.outcomes, correct])
  }

  finish(): DailyChallenge {
    return new DailyChallenge(this.date, this.run.finish(), this.outcomes)
  }

  shareText(quizTitle: string, url: string): string {
    return [
      `Poker 101 Daily, ${this.date}`,
      `${quizTitle}: ${this.run.correct}/${RUN_LENGTH}`,
      this.outcomes.map((correct) => (correct ? '🟩' : '🟥')).join(''),
      url,
    ].join('\n')
  }
}

/** A saved attempt only counts on its own day. */
export function challengeFor(saved: DailyChallenge | null, date: string): DailyChallenge {
  return saved?.date === date ? saved : new DailyChallenge(date)
}
