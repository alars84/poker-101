import type { Rng } from '../domain/deck'
import { SHOWDOWN_SCENARIOS } from '../domain/showdown'
import { dealForScenario, type ShowdownRound } from './scenario'

export type { ShowdownRound }

const PLAYER_NAMES = ['Ana', 'Ben', 'Cara']

export function dealWhoWinsRound(rng: Rng = Math.random): ShowdownRound {
  const scenario = SHOWDOWN_SCENARIOS[Math.floor(rng() * SHOWDOWN_SCENARIOS.length)]
  const playerCount = rng() < 0.5 ? 2 : 3
  return dealForScenario(scenario, PLAYER_NAMES.slice(0, playerCount), rng)
}

export function isCorrectPick(round: ShowdownRound, pickedNames: readonly string[]): boolean {
  const { winners } = round.result
  return (
    pickedNames.length === winners.length &&
    winners.every((winner) => pickedNames.includes(winner.name))
  )
}
