import { useState } from 'react'
import { describeHand } from '../domain/explanation'
import { HAND_CATEGORIES, type HandCategory } from '../domain/hand'
import { dealNameTheHandRound, isCorrectName } from '../drills/nameTheHand'
import { CardRow } from './CardView'
import { Feedback } from './Feedback'
import { capitalize } from './capitalize'

type Props = {
  deal?: typeof dealNameTheHandRound
  onAnswered: (topic: string, correct: boolean) => void
}

const STRONGEST_FIRST = [...HAND_CATEGORIES].reverse()

export function NameTheHandDrill({ deal = dealNameTheHandRound, onAnswered }: Props) {
  const [round, setRound] = useState(() => deal())
  const [answer, setAnswer] = useState<HandCategory | null>(null)

  const bestFive = answer ? round.hand.cards : undefined

  const choose = (category: HandCategory) => {
    setAnswer(category)
    onAnswered('Name the hand', isCorrectName(round, category))
  }
  const nextHand = () => {
    setRound(deal())
    setAnswer(null)
  }

  return (
    <div className="drill">
      <p className="prompt">What's the best five-card hand here?</p>

      <section className="board" aria-label="Board">
        <CardRow cards={round.board} bestFive={bestFive} />
      </section>
      <section className="hole-cards" aria-label="Your hole cards">
        <CardRow cards={round.holeCards} bestFive={bestFive} />
      </section>

      {answer && (
        <Feedback
          correct={isCorrectName(round, answer)}
          message={`Best hand: ${describeHand(round.hand)}.`}
          onNext={nextHand}
        />
      )}

      <div className="options">
        {STRONGEST_FIRST.map((category) => (
          <button
            type="button"
            key={category}
            className={`option ${answer === category ? 'option-chosen' : ''} ${
              answer && category === round.hand.category ? 'option-right' : ''
            }`}
            disabled={answer !== null}
            onClick={() => choose(category)}
          >
            {capitalize(category)}
          </button>
        ))}
      </div>
    </div>
  )
}
