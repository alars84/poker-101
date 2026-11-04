import { ScoreCard } from './scoreCard'

describe('ScoreCard', () => {
  it('starts empty', () => {
    expect(new ScoreCard().topics()).toEqual([])
  })

  it('tallies answers by topic', () => {
    const score = new ScoreCard().record('Kicker', true).record('Kicker', false).record('Split pot', true)
    expect(score.topics()).toEqual([
      { topic: 'Kicker', correct: 1, attempts: 2 },
      { topic: 'Split pot', correct: 1, attempts: 1 },
    ])
  })

  it('leaves the earlier score card unchanged so React sees a new value', () => {
    const before = new ScoreCard()
    before.record('Kicker', true)
    expect(before.topics()).toEqual([])
  })

  it('totals every topic', () => {
    const score = new ScoreCard().record('Kicker', true).record('Split pot', false)
    expect(score.total()).toEqual({ correct: 1, attempts: 2 })
  })
})

describe('ScoreCard.missedTopics', () => {
  it('leaves out topics with no misses', () => {
    const score = new ScoreCard().record('Kicker', true).record('Split pot', false)
    expect(score.missedTopics().map((t) => t.topic)).toEqual(['Split pot'])
  })

  it('puts the topic with the most misses first', () => {
    const score = new ScoreCard()
      .record('Kicker', false)
      .record('Split pot', false)
      .record('Split pot', false)
    expect(score.missedTopics().map((t) => t.topic)).toEqual(['Split pot', 'Kicker'])
  })

  it('breaks a tie in misses by the lower hit rate', () => {
    const score = new ScoreCard()
      .record('Kicker', false)
      .record('Kicker', true)
      .record('Kicker', true)
      .record('Split pot', false)
    expect(score.missedTopics().map((t) => t.topic)).toEqual(['Split pot', 'Kicker'])
  })

  it('is empty after a perfect run', () => {
    expect(new ScoreCard().record('Kicker', true).missedTopics()).toEqual([])
  })
})
