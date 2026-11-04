import { dealBestPossibleRound } from './bestPossibleHand'
import { challengeFor, dailyDeal, DAILY_QUIZZES, DailyChallenge, dateKey, quizForDate } from './dailyChallenge'
import { dealNameTheHandRound } from './nameTheHand'
import { dealOpenOrFoldRound } from './openOrFold'
import { dealOutsRound } from './outsAndOdds'
import { RUN_LENGTH } from './practiceRun'
import { dealWhoWinsRound } from './whoWins'

const DATE = '2026-11-04'

function played(outcomes: readonly boolean[], date = DATE): DailyChallenge {
  return outcomes.reduce((daily, correct) => daily.record('Kicker', correct), new DailyChallenge(date))
}

const allRight = Array<boolean>(RUN_LENGTH).fill(true)

describe('dateKey', () => {
  it('uses the local calendar date, padded', () => {
    expect(dateKey(new Date(2026, 2, 7, 23, 59))).toBe('2026-03-07')
  })
})

describe('quizForDate', () => {
  it('goes through every daily quiz before repeating', () => {
    const week = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'].map(quizForDate)
    expect(week.toSorted()).toEqual([...DAILY_QUIZZES].toSorted())
    expect(quizForDate('2026-11-06')).toBe(week[0])
  })

  it('keeps rotating evenly across the end of a month and a year', () => {
    expect(quizForDate('2026-12-31')).not.toBe(quizForDate('2027-01-01'))
    expect(quizForDate('2027-01-01')).not.toBe(quizForDate('2027-01-02'))
  })
})

describe('dailyDeal', () => {
  it.each([
    ['Who Wins?', dealWhoWinsRound],
    ['Name the Hand', dealNameTheHandRound],
    ['Best Possible Hand', dealBestPossibleRound],
    ['Open or Fold', dealOpenOrFoldRound],
    ['Outs and Odds', dealOutsRound],
  ])('replays every round of %s exactly', (_name, deal) => {
    for (let round = 0; round < RUN_LENGTH; round++) {
      expect(JSON.stringify(deal(dailyDeal(DATE, round)))).toBe(JSON.stringify(deal(dailyDeal(DATE, round))))
    }
  })

  it('deals the same round for the same date and round number', () => {
    expect(dealBestPossibleRound(dailyDeal(DATE, 3))).toEqual(dealBestPossibleRound(dailyDeal(DATE, 3)))
  })

  it('deals a different round each round number', () => {
    const rounds = Array.from({ length: RUN_LENGTH }, (_, round) =>
      JSON.stringify(dealBestPossibleRound(dailyDeal(DATE, round))),
    )
    expect(new Set(rounds).size).toBe(RUN_LENGTH)
  })

  it('deals different rounds on different days', () => {
    expect(dealBestPossibleRound(dailyDeal('2026-11-04', 0))).not.toEqual(
      dealBestPossibleRound(dailyDeal('2026-11-05', 0)),
    )
  })
})

describe('DailyChallenge', () => {
  it('starts with nothing answered', () => {
    const daily = new DailyChallenge(DATE)
    expect(daily.run.status).toBe('not-started')
    expect(daily.outcomes).toEqual([])
  })

  it('plays the quiz for its date', () => {
    expect(new DailyChallenge(DATE).quiz).toBe(quizForDate(DATE))
  })

  it('keeps each answer in order, along with the score', () => {
    const daily = played([true, false, true])
    expect(daily.outcomes).toEqual([true, false, true])
    expect(daily.run.correct).toBe(2)
  })

  it('finishes without losing the answers', () => {
    const daily = played(allRight).finish()
    expect(daily.run.status).toBe('finished')
    expect(daily.outcomes).toHaveLength(RUN_LENGTH)
  })

  it('stays immutable, like the other score objects', () => {
    const daily = new DailyChallenge(DATE)
    daily.record('Kicker', true)
    expect(daily.outcomes).toEqual([])
  })

  it('writes a result to paste into the group chat', () => {
    const outcomes = [true, true, false, true, true, true, false, true, true, true]
    expect(played(outcomes).shareText('Who Wins?', 'https://example.test/#daily')).toBe(
      [
        'Poker 101 Daily, 2026-11-04',
        'Who Wins?: 8/10',
        '🟩🟩🟥🟩🟩🟩🟥🟩🟩🟩',
        'https://example.test/#daily',
      ].join('\n'),
    )
  })
})

describe('challengeFor', () => {
  it("picks the saved attempt if it is today's", () => {
    const saved = played([true])
    expect(challengeFor(saved, DATE)).toBe(saved)
  })

  it('starts a new challenge on a new day', () => {
    const today = challengeFor(played([true], '2026-11-03'), DATE)
    expect(today.date).toBe(DATE)
    expect(today.outcomes).toEqual([])
  })

  it('starts a new challenge when nothing is saved', () => {
    expect(challengeFor(null, DATE).date).toBe(DATE)
  })
})
