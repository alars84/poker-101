import { DailyChallenge } from './dailyChallenge'
import { PracticeRun, RUN_LENGTH } from './practiceRun'
import { RUN_QUIZ_IDS, type RunQuizId } from './quizCatalog'
import { ScoreCard, type TopicScore } from './scoreCard'

const STORAGE_KEY = 'poker-101-progress'
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

export type Progress = {
  readonly score: ScoreCard
  readonly runs: Readonly<Record<RunQuizId, PracticeRun>>
  readonly daily: DailyChallenge | null
}

export function freshProgress(): Progress {
  return {
    score: new ScoreCard(),
    runs: Object.fromEntries(RUN_QUIZ_IDS.map((id) => [id, new PracticeRun()])) as Record<RunQuizId, PracticeRun>,
    daily: null,
  }
}

/** Storage can be blocked or cleared, so a failed save just means starting fresh next time. */
export function saveProgress({ score, runs, daily }: Progress): void {
  try {
    const savedRuns = Object.fromEntries(RUN_QUIZ_IDS.map((id) => [id, runToSave(runs[id])]))
    const savedDaily = daily && { ...runToSave(daily.run), date: daily.date, outcomes: daily.outcomes }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ score: score.topics(), runs: savedRuns, daily: savedDaily }))
  } catch {
    // Practice still works without saving.
  }
}

function runToSave(run: PracticeRun) {
  return { score: run.score.topics(), finished: run.status === 'finished' }
}

export function loadProgress(): Progress {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return parseProgress(saved) ?? freshProgress()
  } catch {
    return freshProgress()
  }
}

function parseProgress(saved: unknown): Progress | null {
  if (!isRecord(saved) || !isTopicScores(saved.score) || !isRecord(saved.runs)) return null
  const fresh = freshProgress()
  const savedRuns = saved.runs
  const runs = Object.fromEntries(
    RUN_QUIZ_IDS.map((id) => [id, parseRun(savedRuns[id]) ?? fresh.runs[id]]),
  ) as Record<RunQuizId, PracticeRun>
  return { score: new ScoreCard(saved.score), runs, daily: parseDaily(saved.daily) }
}

function parseDaily(saved: unknown): DailyChallenge | null {
  if (!isRecord(saved) || typeof saved.date !== 'string' || !DATE_KEY.test(saved.date)) return null
  const run = parseRun(saved)
  if (!run || !isOutcomes(saved.outcomes) || saved.outcomes.length !== run.answered) return null
  return new DailyChallenge(saved.date, run, saved.outcomes)
}

function isOutcomes(value: unknown): value is boolean[] {
  return Array.isArray(value) && value.every((outcome) => typeof outcome === 'boolean')
}

function parseRun(saved: unknown): PracticeRun | null {
  if (!isRecord(saved) || !isTopicScores(saved.score) || typeof saved.finished !== 'boolean') return null
  const run = new PracticeRun(new ScoreCard(saved.score), saved.finished)
  // The quiz on screen isn't saved, so a full run has no round left to come back to.
  return run.answered >= RUN_LENGTH ? run.finish() : run
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTopicScores(value: unknown): value is TopicScore[] {
  return Array.isArray(value) && value.every(isTopicScore)
}

function isTopicScore(value: unknown): value is TopicScore {
  return (
    isRecord(value) &&
    typeof value.topic === 'string' &&
    typeof value.correct === 'number' &&
    typeof value.attempts === 'number'
  )
}
