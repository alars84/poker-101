import { cardLabel, rankLabel, sameCard, suitSymbol, type Card } from '../domain/card'

type CardEmphasis = 'plain' | 'plays' | 'unused'

export function CardView({ card, emphasis = 'plain' }: { card: Card; emphasis?: CardEmphasis }) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  return (
    <span
      role="img"
      aria-label={cardLabel(card)}
      className={`card card-${emphasis} ${isRed ? 'card-red' : 'card-black'}`}
    >
      <span aria-hidden="true">{rankLabel(card.rank)}</span>
      <span aria-hidden="true">{suitSymbol(card.suit)}</span>
    </span>
  )
}

/** Once a hand is known, marks which cards in the row play and which don't. */
export function CardRow({ cards, bestFive }: { cards: readonly Card[]; bestFive?: readonly Card[] }) {
  const emphasisOf = (card: Card): CardEmphasis => {
    if (!bestFive) return 'plain'
    return bestFive.some((played) => sameCard(played, card)) ? 'plays' : 'unused'
  }
  return (
    <span className="card-row">
      {cards.map((card) => (
        <CardView key={cardLabel(card)} card={card} emphasis={emphasisOf(card)} />
      ))}
    </span>
  )
}
