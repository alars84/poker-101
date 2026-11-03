import { SHOWDOWN_SCENARIOS } from '../domain/showdown'
import { seededRng } from '../testing/seededRng'
import { dealForScenario, SCENARIO_LABELS } from './scenario'

const names = ['Ana', 'Ben']

describe('dealForScenario', () => {
  it.each(SHOWDOWN_SCENARIOS)('deals a %s round on request', (scenario) => {
    expect(dealForScenario(scenario, names, seededRng(11)).result.scenario).toBe(scenario)
  })

  it('deals a split pot for three players too', () => {
    const round = dealForScenario('split-pot', ['Ana', 'Ben', 'Cara'], seededRng(5))
    expect(round.result.scenario).toBe('split-pot')
    expect(round.players).toHaveLength(3)
  })

  it('gives each player two hole cards and the board five, with no repeats', () => {
    const round = dealForScenario('kicker', ['Ana', 'Ben', 'Cara'], seededRng(2))
    const dealt = [...round.board, ...round.players.flatMap((player) => player.holeCards)]
    expect(round.board).toHaveLength(5)
    expect(round.players.every((player) => player.holeCards.length === 2)).toBe(true)
    expect(new Set(dealt.map((card) => `${card.rank}${card.suit}`)).size).toBe(dealt.length)
  })

  it('falls back to a legal deal when the scenario never comes up', () => {
    // A constant source shuffles every deck the same, so one deal repeats forever.
    const stuck = () => 0
    const { result: stuckResult } = dealForScenario('kicker', names, stuck)
    const other = SHOWDOWN_SCENARIOS.find((scenario) => scenario !== stuckResult.scenario)!

    const round = dealForScenario(other, names, stuck)

    expect(round.board).toHaveLength(5)
    expect(round.result.scenario).toBe(stuckResult.scenario)
  })
})

describe('SCENARIO_LABELS', () => {
  it('has a label for every scenario', () => {
    for (const scenario of SHOWDOWN_SCENARIOS) expect(SCENARIO_LABELS[scenario]).toBeTruthy()
  })
})
