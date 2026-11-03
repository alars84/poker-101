import { cards } from '../domain/card'
import type { HandCategory } from '../domain/hand'
import { capitalize } from '../drills/capitalize'
import { CardRow } from './CardView'

const STRONGEST_FIRST: { category: HandCategory; example: string; note: string }[] = [
  { category: 'royal flush', example: 'As Ks Qs Js Ts', note: 'Ace-high straight, all one suit.' },
  { category: 'straight flush', example: '9h 8h 7h 6h 5h', note: 'Five in a row, all one suit.' },
  { category: 'four of a kind', example: 'Qs Qh Qd Qc 7s', note: 'Four of one rank.' },
  { category: 'full house', example: 'Ts Th Td 4c 4d', note: 'Three of one rank, two of another.' },
  { category: 'flush', example: 'Ad Jd 8d 6d 3d', note: 'Five of one suit, in any order.' },
  { category: 'straight', example: '8c 7d 6s 5h 4c', note: 'Five in a row. Ace can be high or low, but no wrapping around.' },
  { category: 'three of a kind', example: '7s 7h 7d Kc 2d', note: 'Three of one rank.' },
  { category: 'two pair', example: 'Js Jh 3d 3c 9s', note: 'Two different pairs.' },
  { category: 'pair', example: 'As Ah Kd 8c 4s', note: 'Two of one rank.' },
  { category: 'high card', example: 'Ad Js 8c 6h 2s', note: 'None of the above. Highest card leads.' },
]

export function RankingsChart() {
  return (
    <div className="rankings">
      <p className="prompt">Strongest at the top. Only your best five cards count, from your two and the board's five.</p>
      <ol>
        {STRONGEST_FIRST.map(({ category, example, note }) => (
          <li key={category} className="ranking">
            <h2>{capitalize(category)}</h2>
            <CardRow cards={cards(example)} />
            <p>{note}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
