import { Deck, type Rng } from '../domain/deck'
import { resolveShowdown, type Player, type ShowdownResult, type ShowdownScenario } from '../domain/showdown'
import type { Card } from '../domain/card'

export type ShowdownRound = {
  readonly board: readonly Card[]
  readonly players: readonly Player[]
  readonly result: ShowdownResult
}

export const SCENARIO_LABELS: Record<ShowdownScenario, string> = {
  'different-category': 'Different hands',
  'higher-rank': 'Higher rank',
  kicker: 'Kicker',
  'split-pot': 'Split pot',
  'board-plays': 'Board plays',
}

// The rarest target, the board playing, turns up about 8 times per 1,000 deals.
const MAX_DEALS = 5000

/** Deals until the cards fit the scenario, then settles for the last deal. */
export function dealForScenario(target: ShowdownScenario, playerNames: readonly string[], rng: Rng): ShowdownRound {
  let round = dealShowdown(playerNames, rng)
  for (let i = 1; i < MAX_DEALS && round.result.scenario !== target; i++) {
    round = dealShowdown(playerNames, rng)
  }
  return round
}

function dealShowdown(playerNames: readonly string[], rng: Rng): ShowdownRound {
  const deck = new Deck(rng)
  const players = playerNames.map((name) => ({ name, holeCards: deck.deal(2) }))
  const board = deck.deal(5)
  return { board, players, result: resolveShowdown(board, players) }
}
