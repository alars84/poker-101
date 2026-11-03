export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const
export type Suit = (typeof SUITS)[number]

// Ace is 14. It also plays low in the wheel straight, which hand.ts handles.
export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const
export type Rank = (typeof RANKS)[number]

export type Card = { readonly rank: Rank; readonly suit: Suit }

const RANK_CODES = '23456789TJQKA'
const SUIT_CODES: Record<string, Suit> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
const SUIT_SYMBOLS: Record<Suit, string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }
const FACE_LABELS: Partial<Record<Rank, string>> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }

export function allCards(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })))
}

/** Reads shorthand like "Ah" or "Ts". */
export function card(shorthand: string): Card {
  const rankIndex = RANK_CODES.indexOf(shorthand[0])
  const suit = SUIT_CODES[shorthand[1]]
  if (shorthand.length !== 2 || rankIndex < 0 || !suit) {
    throw new Error(`Not a card: ${shorthand}`)
  }
  return { rank: RANKS[rankIndex], suit }
}

/** Reads a space-separated list like "Ah Kd 2c". */
export function cards(shorthand: string): Card[] {
  return shorthand.split(' ').map(card)
}

export function rankLabel(rank: Rank): string {
  return FACE_LABELS[rank] ?? String(rank)
}

export function suitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit]
}

export function cardLabel(card: Card): string {
  return `${rankLabel(card.rank)}${suitSymbol(card.suit)}`
}

export function sameCard(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit
}
