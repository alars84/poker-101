import { HAND_CATEGORIES } from '../domain/hand'
import { capitalize } from './capitalize'
import { PRACTICE_TIPS, PracticeRun, RUN_LENGTH } from './practiceRun'
import { RULES_TOPICS } from './rulesQuestions'
import { SCENARIO_LABELS } from './scenario'

describe('a practice run', () => {
  it('is ten rounds long', () => {
    expect(RUN_LENGTH).toBe(10)
  })

  it.each([
    ...Object.values(SCENARIO_LABELS),
    ...RULES_TOPICS,
    ...HAND_CATEGORIES.map(capitalize),
  ])('has a practice tip for %s', (topic) => {
    expect(PRACTICE_TIPS[topic]).toBeTruthy()
  })
})

describe('PracticeRun', () => {
  const answered = (count: number) => {
    let run = new PracticeRun()
    for (let i = 0; i < count; i++) run = run.record('Kicker', true)
    return run
  }

  it('starts with nothing answered', () => {
    expect(new PracticeRun().status).toBe('not-started')
    expect(new PracticeRun().answered).toBe(0)
  })

  it('is in progress after the first answer', () => {
    expect(answered(1).status).toBe('in-progress')
  })

  it('counts answered rounds and correct ones separately', () => {
    const run = new PracticeRun().record('Kicker', true).record('Kicker', false)
    expect(run.answered).toBe(2)
    expect(run.correct).toBe(1)
  })

  it('reaches its last round on the tenth answer, not before', () => {
    expect(answered(9).isLastRound).toBe(false)
    expect(answered(10).isLastRound).toBe(true)
  })

  it('stays in progress until the results are seen', () => {
    expect(answered(10).status).toBe('in-progress')
    expect(answered(10).finish().status).toBe('finished')
  })

  it('leaves the earlier run unchanged so React sees a new value', () => {
    const before = new PracticeRun()
    before.record('Kicker', true)
    expect(before.answered).toBe(0)
  })
})
