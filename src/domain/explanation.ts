import { rankLabel, type Rank } from './card'
import { firstDifference, hasKickers, type Hand } from './hand'
import type { ShowdownResult } from './showdown'

const RANK_NAMES: Record<Rank, string> = {
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'jack',
  12: 'queen',
  13: 'king',
  14: 'ace',
}

const plural = (rank: Rank) => (rank === 6 ? 'sixes' : `${RANK_NAMES[rank]}s`)

export function describeHand(hand: Hand): string {
  const [first, second] = hand.tiebreakers
  switch (hand.category) {
    case 'high card':
      return `${RANK_NAMES[first]} high`
    case 'pair':
      return `a pair of ${plural(first)}`
    case 'two pair':
      return `two pair, ${plural(first)} and ${plural(second)}`
    case 'three of a kind':
      return `three ${plural(first)}`
    case 'straight':
      return `a straight to the ${RANK_NAMES[first]}`
    case 'flush':
      return `a flush, ${hand.tiebreakers.map(rankLabel).join(' ')}`
    case 'full house':
      return `a full house, ${plural(first)} over ${plural(second)}`
    case 'four of a kind':
      return `four ${plural(first)}`
    case 'straight flush':
      return `a straight flush to the ${RANK_NAMES[first]}`
    case 'royal flush':
      return 'a royal flush'
  }
}

export function explainShowdown(result: ShowdownResult): string {
  const { scenario, winners, winningHand, boardHand, runnerUp } = result
  const description = describeHand(winningHand)

  if (scenario === 'board-plays') {
    return `The board makes ${describeHand(boardHand)}. No hole card beats it, so everyone splits the pot.`
  }
  if (scenario === 'split-pot') {
    const kickers = hasKickers(winningHand) ? ' and the same kickers' : ''
    return `${listNames(winners.map((winner) => winner.name))} tie with ${description}${kickers}, so they split the pot.`
  }

  const [winner] = winners
  if (!runnerUp) return `${winner.name} wins with ${description}.`
  if (scenario === 'kicker') {
    const kicker = firstDifference(winningHand, runnerUp.hand)
    const winnerKicker = RANK_NAMES[winningHand.tiebreakers[kicker]]
    const runnerUpKicker = RANK_NAMES[runnerUp.hand.tiebreakers[kicker]]
    return `Both have ${description}. ${winner.name}'s ${winnerKicker} kicker beats ${runnerUp.player.name}'s ${runnerUpKicker}.`
  }
  return `${winner.name}'s ${withoutArticle(description)} beats ${runnerUp.player.name}'s ${withoutArticle(describeHand(runnerUp.hand))}.`
}

function withoutArticle(description: string): string {
  return description.replace(/^a /, '')
}

function listNames(names: string[]): string {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
}
