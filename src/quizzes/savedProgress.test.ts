import { vi } from 'vitest'
import { DailyChallenge } from './dailyChallenge'
import { PracticeRun, RUN_LENGTH } from './practiceRun'
import { RUN_QUIZ_IDS } from './quizCatalog'
import { freshProgress, loadProgress, saveProgress, type Progress } from './savedProgress'
import { ScoreCard } from './scoreCard'

const STORAGE_KEY = 'poker-101-progress'

const progressWith = (changes: Partial<Progress>): Progress => ({ ...freshProgress(), ...changes })

function answered(count: number): PracticeRun {
  let run = new PracticeRun()
  for (let i = 0; i < count; i++) run = run.record('Kicker', true)
  return run
}

describe('saved progress', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts fresh when nothing is saved', () => {
    const { score, runs } = loadProgress()
    expect(score.total()).toEqual({ correct: 0, attempts: 0 })
    expect(RUN_QUIZ_IDS.every((id) => runs[id].status === 'not-started')).toBe(true)
  })

  it('brings back the overall score', () => {
    saveProgress(progressWith({ score: new ScoreCard().record('Kicker', true).record('Kicker', false) }))
    expect(loadProgress().score.topics()).toEqual([{ topic: 'Kicker', correct: 1, attempts: 2 }])
  })

  it('brings back a run in progress', () => {
    const runs = { ...freshProgress().runs, 'who-wins': answered(3) }
    saveProgress(progressWith({ runs }))

    const restored = loadProgress().runs['who-wins']

    expect(restored.status).toBe('in-progress')
    expect(restored.answered).toBe(3)
  })

  it('brings back a finished run', () => {
    const runs = { ...freshProgress().runs, 'who-wins': answered(RUN_LENGTH).finish() }
    saveProgress(progressWith({ runs }))
    expect(loadProgress().runs['who-wins'].status).toBe('finished')
  })

  it('treats a run with every round answered as finished, so a reload cannot deal an extra round', () => {
    const runs = { ...freshProgress().runs, 'who-wins': answered(RUN_LENGTH) }
    saveProgress(progressWith({ runs }))
    expect(loadProgress().runs['who-wins'].status).toBe('finished')
  })

  it('keeps the rest of the save when a quiz is missing from it', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ score: [{ topic: 'Kicker', correct: 1, attempts: 1 }], runs: {} }),
    )
    const { score, runs } = loadProgress()
    expect(score.total().attempts).toBe(1)
    expect(runs['who-wins'].status).toBe('not-started')
  })

  it('brings back the daily challenge, in order', () => {
    const daily = new DailyChallenge('2026-11-04').record('Kicker', true).record('Kicker', false)
    saveProgress(progressWith({ daily }))

    const restored = loadProgress().daily

    expect(restored?.date).toBe('2026-11-04')
    expect(restored?.outcomes).toEqual([true, false])
    expect(restored?.run.answered).toBe(2)
  })

  it('brings back a finished daily challenge', () => {
    let daily = new DailyChallenge('2026-11-04')
    for (let i = 0; i < RUN_LENGTH; i++) daily = daily.record('Kicker', true)
    saveProgress(progressWith({ daily: daily.finish() }))
    expect(loadProgress().daily?.run.status).toBe('finished')
  })

  it('drops a daily challenge whose answers do not add up, and keeps the rest', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        score: [{ topic: 'Kicker', correct: 1, attempts: 1 }],
        runs: {},
        daily: { date: '2026-11-04', score: [], finished: false, outcomes: [true] },
      }),
    )
    const { score, daily } = loadProgress()
    expect(daily).toBeNull()
    expect(score.total().attempts).toBe(1)
  })

  it.each([
    ['text that is not JSON', 'not json'],
    ['the wrong shape', JSON.stringify({ score: 'lots' })],
    ['a bad topic score', JSON.stringify({ score: [{ topic: 'Kicker', correct: 'one', attempts: 1 }], runs: {} })],
    ['null', 'null'],
  ])('starts fresh when the save holds %s', (_name, saved) => {
    localStorage.setItem(STORAGE_KEY, saved)
    expect(loadProgress().score.total().attempts).toBe(0)
  })

  it('still works when the browser blocks storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => saveProgress(freshProgress())).not.toThrow()
    expect(loadProgress().score.total().attempts).toBe(0)
  })
})
