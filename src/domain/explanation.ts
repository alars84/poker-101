import { cardLabel, rankLabel, type Card, type Rank } from './card'
import type { BoardTexture } from './bestPossibleHand'
import { firstDifference, hasKickers, type Hand } from './hand'
import { earliestOpeningSeat } from './openingChart'
import { priceToCall } from './potOdds'
import type { ShowdownResult } from './showdown'
import { startingHandShape, type StartingHand, type StartingHandShape } from './startingHand'

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

const SHAPE_REASONS: Record<StartingHandShape, string> = {
  pair: 'Big pairs are often ahead already. Small pairs mostly hope to flop a set, which needs a cheap price.',
  'suited ace': 'Suited aces can make the top flush, but a weak kicker is trouble when you only pair the ace.',
  'big cards': 'Big cards make strong top pairs, but a weak kicker can lose a big pot.',
  'suited connector': 'Suited connectors make straights and flushes, but they need a good seat to pay off.',
  weak: 'Hands like this rarely make the best hand, so they only work late in the order, if at all.',
}

/** Says which seats open a starting hand, and why. */
export function explainOpening(hand: StartingHand): string {
  const named = hand.high === hand.low ? hand.label : `${hand.label} (${hand.suited ? 'suited' : 'offsuit'})`
  return `${named} ${seatsThatOpen(hand)} ${SHAPE_REASONS[startingHandShape(hand)]}`
}

function seatsThatOpen(hand: StartingHand): string {
  switch (earliestOpeningSeat(hand)) {
    case 'early':
      return 'opens from any seat.'
    case 'middle':
      return 'opens from middle position or later.'
    case 'late':
      return 'opens from late position only.'
    case null:
      return "doesn't open from any seat."
  }
}

const TEXTURE_NOTES: Record<BoardTexture, string> = {
  paired: 'A paired board makes four of a kind possible.',
  flush: 'Three cards of one suit make a flush possible.',
  straight: 'Three cards close in rank make a straight possible.',
  dry: 'No flush or straight is possible, so top set is best.',
}

export function explainBestPossibleHand(hand: Hand, holeCards: readonly Card[], texture: BoardTexture): string {
  const cardsNamed = holeCards.map(cardLabel).join(' ')
  return `The best possible hand is ${describeHand(hand)}, with ${cardsNamed}. ${TEXTURE_NOTES[texture]}`
}

export function outsLabel(outs: number): string {
  return outs === 1 ? '1 out' : `${outs} outs`
}

const percent = (share: number) => `${Math.round(share * 100)}%`

export function explainOuts(outs: number, cardsToCome: 1 | 2): string {
  const [cardsNamed, multiplier] = cardsToCome === 2 ? ['two cards', 4] : ['one card', 2]
  return `You have ${outsLabel(outs)}. With ${cardsNamed} to come, multiply by ${multiplier}: about ${outs * multiplier}%.`
}

/** Uses the rule of 2, since that's the math a player can do at the table. */
export function explainPotOdds(outs: number, pot: number, call: number): string {
  const price = priceToCall(pot, call)
  const estimate = outs * 2
  const decision = estimate / 100 > price ? 'call' : 'fold'
  return (
    `Your $${call} call goes into a final pot of $${pot + call}, so you need to hit about ${percent(price)} of the time. ` +
    `${outsLabel(outs)} times 2 is about ${estimate}%, so ${decision}.`
  )
}
