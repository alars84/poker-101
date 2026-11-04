import { ScoreCard } from './scoreCard'

export const RUN_LENGTH = 10

export type RunStatus = 'not-started' | 'in-progress' | 'finished'

/** Immutable, like ScoreCard: each change returns a new run for React state. */
export class PracticeRun {
  readonly score: ScoreCard
  readonly #finished: boolean

  constructor(score: ScoreCard = new ScoreCard(), finished = false) {
    this.score = score
    this.#finished = finished
  }

  record(topic: string, correct: boolean): PracticeRun {
    return new PracticeRun(this.score.record(topic, correct))
  }

  finish(): PracticeRun {
    return new PracticeRun(this.score, true)
  }

  get answered(): number {
    return this.score.total().attempts
  }

  get correct(): number {
    return this.score.total().correct
  }

  get isLastRound(): boolean {
    return this.answered >= RUN_LENGTH
  }

  get status(): RunStatus {
    if (this.#finished) return 'finished'
    return this.answered > 0 ? 'in-progress' : 'not-started'
  }
}

export const PRACTICE_TIPS: Record<string, string> = {
  // Who Wins? scenarios
  'Different hands': "Name each player's best five first, then compare them using the hand rankings.",
  'Higher rank': 'Same hand type? Compare the top of the hand first: the higher pair, set, or straight wins.',
  Kicker: 'When the made hands tie, compare the side cards from highest down, and stop at five cards.',
  'Split pot': 'If two best fives match rank for rank, suits never break the tie, so the pot splits.',
  'Board plays': 'Read the board first. If no hole card beats its five cards, everyone splits.',

  // Name the Hand categories
  'Royal flush': 'Only 10-J-Q-K-A of one suit counts. Any lower run is a straight flush.',
  'Straight flush': 'Check for five in a row inside the suit, not just five suited cards and a straight.',
  'Four of a kind': 'Count ranks across the board and your hole cards together.',
  'Full house': 'Look for a set plus any pair. Two sets also make a full house.',
  Flush: 'Count suits across all seven cards. You need five of one suit.',
  Straight: 'Sort the ranks and look for five in a row. The ace can be high or low, but never wraps around.',
  'Three of a kind': 'Three of one rank. If you also have a pair, it is a full house.',
  'Two pair': 'With three pairs available, only the best two count.',
  Pair: 'Check the board for a pair too. Everyone gets to use it.',
  'High card': 'Before settling on high card, rule out a five-card run and five of a suit.',

  // Rules Quiz topics
  'Blinds and position': 'Picture the table: blinds sit left of the button, and after the flop action starts there too.',
  Betting: 'A raise must add at least as much as the last raise. Say "raise" before you reach for chips.',
  'All-ins and side pots': 'You can only win from each player what you put in yourself. Split the pot at each all-in amount.',
  Showdowns: 'The last bettor shows first, the cards speak, and any five of the seven cards can play.',
}
