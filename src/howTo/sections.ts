import type { GroupTitle, QuizId } from '../quizzes/quizCatalog'

export type HowToPoint = { readonly title: string; readonly body: string }

export type HowToSection = {
  readonly id: string
  readonly group: GroupTitle
  readonly title: string
  readonly summary: string
  /** The score card topics this section teaches, so a missed topic can link here. */
  readonly topics: readonly string[]
  readonly quiz: QuizId
  readonly points: readonly HowToPoint[]
  readonly showsRankingsChart?: boolean
}

export const HOW_TO_SECTIONS: readonly HowToSection[] = [
  {
    id: 'hand-rankings',
    group: 'Know the game',
    title: 'Hand rankings',
    summary: 'The ten hands, strongest first.',
    topics: [],
    quiz: 'rankings',
    showsRankingsChart: true,
    points: [
      {
        title: 'The two people mix up',
        body: 'A flush beats a straight, and a full house beats a flush. If you forget, come back here before the next game.',
      },
    ],
  },
  {
    id: 'how-a-hand-runs',
    group: 'Know the game',
    title: 'How a hand runs',
    summary: 'Blinds, the order of play, and what you can bet.',
    topics: ['Blinds and position', 'Betting'],
    quiz: 'rules-quiz',
    points: [
      {
        title: 'The button and the blinds',
        body: 'The dealer button moves one seat left each hand. The small blind sits directly left of it, and the big blind directly left of that. Both post before any cards come out.',
      },
      {
        title: 'Four rounds of betting',
        body: 'Everyone gets two cards, then there is a round of betting. The flop adds three cards to the board, the turn adds one, and the river adds one, with a round of betting after each.',
      },
      {
        title: 'Who acts when',
        body: 'Before the flop, action starts left of the big blind. After the flop, it starts with the first player still in the hand left of the button. The button acts last, which makes it the best seat.',
      },
      {
        title: 'Your choices',
        body: 'If nobody has bet, you can check or bet. If there is a bet, you can call, raise, or fold. The big blind gets to check or raise if everyone just calls.',
      },
      {
        title: 'Smallest bets and raises',
        body: 'The smallest bet is one big blind. A raise must add at least as much as the last raise. At $1/$2, a raise to $6 added $4, so the next raise has to go to at least $10.',
      },
      {
        title: 'Down to two players',
        body: 'Heads-up, the button posts the small blind, acts first before the flop, and acts last after it.',
      },
    ],
  },
  {
    id: 'all-ins-and-side-pots',
    group: 'Know the game',
    title: 'All-ins and side pots',
    summary: 'Who can win what when someone runs out of chips.',
    topics: ['All-ins and side pots'],
    quiz: 'rules-quiz',
    points: [
      {
        title: 'Table stakes',
        body: "You can only play the chips in front of you. You can't go to your wallet mid-hand, and you can't be bet out of a hand either: you go all-in for less.",
      },
      {
        title: 'The one rule to remember',
        body: 'You can only win from each player what you put in yourself. Everything else follows from that.',
      },
      {
        title: 'How to build a side pot',
        body: 'Take the smallest all-in and collect that much from everyone. That is the main pot. Whatever is left goes into a side pot that only the players who paid into it can win.',
      },
      {
        title: 'An example',
        body: 'Ana is all-in for $20. Ben and Cara each put in $50. The main pot is $60, and all three can win it. The side pot is the other $60, and only Ben and Cara can win it.',
      },
      {
        title: 'Short all-ins',
        body: "An all-in that is less than a full raise doesn't reopen the betting. Players who already acted can only call or fold.",
      },
    ],
  },
  {
    id: 'running-a-home-game',
    group: 'Know the game',
    title: 'Running a home game',
    summary: 'Showdowns and the spots that start arguments.',
    topics: ['Showdowns'],
    quiz: 'rules-quiz',
    points: [
      {
        title: 'Agree before the first hand',
        body: 'Settle the buy-in, the blinds, and any house rules up front. A few home games ban check-raising, for example. It is much easier to decide before anyone has money in the pot.',
      },
      {
        title: 'String bets',
        body: 'Say "raise" before you reach for chips, or put them all out in one motion. If you put out a call and go back for more, it only counts as a call.',
      },
      {
        title: 'The big chip',
        body: 'One oversized chip with no announcement is a call. Say "raise" if you mean to raise.',
      },
      {
        title: 'Misdeals',
        body: 'Cards flipped during the deal, or someone dealt the wrong number? The usual fix is to collect the cards and redeal before any betting starts. House rules vary, so pick one ahead of time.',
      },
      {
        title: 'Who shows first',
        body: 'The last player to bet or raise on the river shows first. If the river was checked around, the first player still in left of the button shows first.',
      },
      {
        title: 'The cards speak',
        body: 'What counts is the cards face up, not what anyone says about them. If someone calls a pair but has a flush, they have a flush.',
      },
      {
        title: 'The odd chip',
        body: "If a pot won't split evenly, the extra chip goes to the first winner left of the button.",
      },
    ],
  },
  {
    id: 'reading-your-hand',
    group: 'Read the cards',
    title: 'Reading your hand',
    summary: 'Find your best five cards every time.',
    topics: [
      'Royal flush',
      'Straight flush',
      'Four of a kind',
      'Full house',
      'Flush',
      'Straight',
      'Three of a kind',
      'Two pair',
      'Pair',
      'High card',
    ],
    quiz: 'name-the-hand',
    points: [
      {
        title: 'Best five of seven',
        body: "Your hand is the best five cards from your two and the board's five. You can use two of your cards, one, or none.",
      },
      {
        title: 'A quick order to check',
        body: 'Look for five of a suit, then five in a row, then count matching ranks. The first two are the ones people miss.',
      },
      {
        title: 'Pairs on the board',
        body: 'A pair on the board belongs to everyone. Count it along with your own cards.',
      },
      {
        title: 'Too many pairs',
        body: 'With three pairs available, only the best two count. Two sets make a full house.',
      },
      {
        title: 'Aces in straights',
        body: 'An ace can be high or low, but a straight never wraps around. Q-K-A-2-3 is not a straight.',
      },
      {
        title: 'Straight flushes',
        body: 'The five in a row have to be inside one suit. A flush and a separate straight in the same hand is not a straight flush. A royal flush is 10-J-Q-K-A of one suit.',
      },
    ],
  },
  {
    id: 'comparing-hands',
    group: 'Read the cards',
    title: 'Comparing hands',
    summary: 'Kickers, split pots, and when the board plays.',
    topics: ['Different hands', 'Higher rank', 'Kicker', 'Split pot', 'Board plays'],
    quiz: 'who-wins',
    points: [
      {
        title: 'Hand type first',
        body: "Name each player's best five, then compare them using the hand rankings.",
      },
      {
        title: 'Same type? Compare the top',
        body: 'The higher pair, set, or straight wins. With two pair, compare the top pair first.',
      },
      {
        title: 'Kickers',
        body: 'When the made hands tie, compare the side cards from highest down, and stop at five cards. K-K-A-9-4 beats K-K-Q-J-10. A straight or full house uses all five cards, so it has no kicker.',
      },
      {
        title: 'Split pots',
        body: 'If two best fives match rank for rank, the pot splits. Suits never break a tie.',
      },
      {
        title: 'When the board plays',
        body: 'Read the board first. If no hole card improves on its five cards, everyone still in splits the pot.',
      },
    ],
  },
  {
    id: 'reading-the-board',
    group: 'Read the cards',
    title: 'Reading the board',
    summary: 'Work out the strongest hand anyone could have.',
    topics: ['Paired boards', 'Flush boards', 'Straight boards', 'Dry boards'],
    quiz: 'best-possible-hand',
    points: [
      {
        title: 'Why it matters',
        body: 'Knowing the best possible hand tells you how worried to be. Check the board before you think about your own cards.',
      },
      {
        title: 'Paired boards',
        body: 'A pair on the board means four of a kind is possible, and that beats any full house.',
      },
      {
        title: 'Flush boards',
        body: 'Three of a suit on the board means a flush is possible. Then check whether those cards leave room for a straight flush.',
      },
      {
        title: 'Straight boards',
        body: 'Look for three board cards within a five-card span. Two hole cards can fill in the rest.',
      },
      {
        title: 'Dry boards',
        body: 'With no pair, no three of a suit, and no three close ranks, top set is the best hand.',
      },
    ],
  },
  {
    id: 'starting-hands',
    group: 'Make the play',
    title: 'Starting hands',
    summary: 'A simple chart for which hands to raise from each seat.',
    topics: ['Early position', 'Middle position', 'Late position'],
    quiz: 'open-or-fold',
    points: [
      {
        title: 'Why your seat matters',
        body: 'The fewer players left to act behind you, the fewer can wake up with a better hand. So the later your seat, the more hands you can raise.',
      },
      {
        title: 'Early position',
        body: 'Raise pairs of 7s or better, AK and AQ of any suits, and suited AJ, AT, KQ, KJ, and QJ. Fold the rest.',
      },
      {
        title: 'Middle position',
        body: 'Add 66 and 55, AJ and KQ of any suits, and suited A9, KT, QT, JT, and T9.',
      },
      {
        title: 'Late position',
        body: 'Add every other pair, every suited ace, and connected suited cards down to 65. Add AT, KJ, KT, QJ, QT, and JT of any suits, plus suited K9, K8, Q9, J9, and T8.',
      },
      {
        title: 'What this chart assumes',
        body: 'It is for raising when everyone has folded to you at a nine-player table. With fewer players there are fewer people behind you, so you can open a little wider. If someone has already raised, play tighter.',
      },
    ],
  },
  {
    id: 'outs-and-odds',
    group: 'Make the play',
    title: 'Outs and odds',
    summary: 'Whether a draw is worth the price, without a calculator.',
    topics: ['Counting outs', 'Pot odds'],
    quiz: 'outs-and-odds',
    points: [
      {
        title: 'What counts as an out',
        body: 'An out is a card still to come that makes your hand. Common counts are 9 for a flush draw, 8 for an open-ended straight draw, and 4 for a gutshot. Count a card once, even if it helps both draws.',
      },
      {
        title: 'Your chance of hitting',
        body: 'With two cards to come, multiply your outs by 4. With one card to come, multiply by 2. That is close enough for the table.',
      },
      {
        title: 'The price of a call',
        body: 'Divide your call by the final pot, which includes your call. A $20 call into a $60 pot goes into a final pot of $80, so you need to hit 25% of the time.',
      },
      {
        title: 'Put them together',
        body: 'Call only if your chance is bigger than the price. A flush draw on the turn is about 18%. That is a fold at 25%, but a call if it costs $10 to win $100, where you only need about 9%.',
      },
      {
        title: 'At the table',
        body: 'This math ignores future bets. If a friend will pay you off when you hit, a slightly bad price can still be fine. Against someone who folds when the draw comes in, stick to the math.',
      },
    ],
  },
  {
    id: 'player-types',
    group: 'Make the play',
    title: 'Player types',
    summary: 'Spot the regulars in your game and adjust.',
    topics: ['Player types', 'Adjusting', 'Reading the betting'],
    quiz: 'read-the-player',
    points: [
      {
        title: 'Two questions',
        body: 'How many hands do they play (tight or loose), and do they bet or just call (aggressive or passive)? These are tendencies, so keep watching what your players actually do.',
      },
      {
        title: 'The calling station',
        body: 'Your friend who calls everything. Bet your good hands, and bet them bigger than usual. Don\'t bluff, because they won\'t fold.',
      },
      {
        title: 'The nit',
        body: 'Folds for an hour, then raises big. Take their blinds when you can, and believe them when they put money in.',
      },
      {
        title: 'The maniac',
        body: "Raises nearly every hand, so their bets tell you very little. You don't need to out-raise them. Wait for a solid hand and let them put the chips in.",
      },
      {
        title: 'The tight-aggressive player',
        body: 'Picks good spots, then presses them. Usually the toughest player at the table. Give their early raises respect, and avoid playing weak hands against them.',
      },
      {
        title: 'Read the betting',
        body: 'How someone bets over many hands tells you more than any physical tell. Compare a bet to their usual pattern. A sudden change usually means a strong hand.',
      },
    ],
  },
]

export function sectionForTopic(topic: string): HowToSection | undefined {
  return HOW_TO_SECTIONS.find((section) => section.topics.includes(topic))
}
