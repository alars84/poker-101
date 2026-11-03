import type { Card } from './card'
import { compareHands, decidedByKicker, evaluateBestHand, type Hand } from './hand'

export type Player = { readonly name: string; readonly holeCards: readonly Card[] }

export const SHOWDOWN_SCENARIOS = [
  'different-category',
  'higher-rank',
  'kicker',
  'split-pot',
  'board-plays',
] as const
export type ShowdownScenario = (typeof SHOWDOWN_SCENARIOS)[number]

export type ShowdownResult = {
  /** One per player, in the order the players were given. */
  readonly hands: readonly Hand[]
  readonly winners: readonly Player[]
  readonly winningHand: Hand
  readonly boardHand: Hand
  /** The closest losing player. Null when nobody lost. */
  readonly runnerUp: { readonly player: Player; readonly hand: Hand } | null
  readonly scenario: ShowdownScenario
}

export function resolveShowdown(board: readonly Card[], players: readonly Player[]): ShowdownResult {
  const seats = players.map((player) => ({
    player,
    hand: evaluateBestHand([...board, ...player.holeCards]),
  }))
  const byStrength = [...seats].sort((a, b) => compareHands(b.hand, a.hand))
  const winningHand = byStrength[0].hand
  const winners = seats.filter((seat) => compareHands(seat.hand, winningHand) === 0)
  const runnerUp = byStrength[winners.length] ?? null
  const boardHand = evaluateBestHand(board)

  return {
    hands: seats.map((seat) => seat.hand),
    winners: winners.map((seat) => seat.player),
    winningHand,
    boardHand,
    runnerUp,
    scenario: scenarioOf(winningHand, boardHand, winners.length, runnerUp?.hand),
  }
}

function scenarioOf(
  winningHand: Hand,
  boardHand: Hand,
  winnerCount: number,
  runnerUpHand: Hand | undefined,
): ShowdownScenario {
  // Every player can use the board, so a winning board hand ties the whole table.
  if (compareHands(winningHand, boardHand) === 0) return 'board-plays'
  if (winnerCount > 1) return 'split-pot'
  if (!runnerUpHand || winningHand.category !== runnerUpHand.category) return 'different-category'
  return decidedByKicker(winningHand, runnerUpHand) ? 'kicker' : 'higher-rank'
}
