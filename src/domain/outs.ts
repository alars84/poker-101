import { allCards, sameCard, type Card } from './card'
import { evaluateBestHand, isStraightOrBetter } from './hand'

/**
 * The unseen cards that make you a straight or better. Testing card by card
 * means a card that completes two draws still counts once.
 */
export function findOuts(holeCards: readonly Card[], board: readonly Card[]): Card[] {
  const seen = [...holeCards, ...board]
  return allCards()
    .filter((card) => !seen.some((seenCard) => sameCard(seenCard, card)))
    .filter((card) => makesYourHand(card, holeCards, board))
}

function makesYourHand(card: Card, holeCards: readonly Card[], board: readonly Card[]): boolean {
  // Board first, so a hole card only shows up in the hand if it really plays.
  const hand = evaluateBestHand([...board, card, ...holeCards])
  return isStraightOrBetter(hand) && hand.cards.some((played) => holeCards.some((hole) => sameCard(hole, played)))
}
