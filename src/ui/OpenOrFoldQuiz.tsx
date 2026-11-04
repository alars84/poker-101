import { useState } from 'react'
import { explainOpening } from '../domain/explanation'
import { startingHandOf } from '../domain/startingHand'
import {
  dealOpenOrFoldRound,
  isCorrectDecision,
  openOrFoldTopic,
  type OpeningDecision,
} from '../quizzes/openOrFold'
import { capitalize } from '../quizzes/capitalize'
import { CardRow } from './CardView'
import { Feedback } from './Feedback'

type Props = {
  deal?: typeof dealOpenOrFoldRound
  onAnswered: (topic: string, correct: boolean) => void
  isLastRound?: boolean
  onFinish?: () => void
}

const DECISIONS: readonly OpeningDecision[] = ['raise', 'fold']

export function OpenOrFoldQuiz({ deal = dealOpenOrFoldRound, onAnswered, isLastRound = false, onFinish }: Props) {
  const [round, setRound] = useState(() => deal())
  const [answer, setAnswer] = useState<OpeningDecision | null>(null)

  const choose = (decision: OpeningDecision) => {
    setAnswer(decision)
    onAnswered(openOrFoldTopic(round.seat), isCorrectDecision(round, decision))
  }
  const nextHand = () => {
    setRound(deal())
    setAnswer(null)
  }

  return (
    <div className="quiz">
      <p className="prompt">
        Nine players, no antes. Early is the first three seats after the blinds, middle the next two, and late the
        last two.
      </p>

      <section className="question">
        <p className="question-topic">{openOrFoldTopic(round.seat)}</p>
        <p className="question-prompt">Everyone folded to you in {round.seat} position. Raise or fold?</p>
      </section>

      <section className="hole-cards" aria-label="Your hole cards">
        <CardRow cards={round.holeCards} />
      </section>

      <div className="options">
        {DECISIONS.map((decision) => (
          <button
            type="button"
            key={decision}
            className={`option ${answer === decision ? 'option-chosen' : ''} ${
              answer && isCorrectDecision(round, decision) ? 'option-right' : ''
            }`}
            disabled={answer !== null}
            onClick={() => choose(decision)}
          >
            {capitalize(decision)}
          </button>
        ))}
      </div>

      {answer && (
        <Feedback
          correct={isCorrectDecision(round, answer)}
          message={explainOpening(startingHandOf(round.holeCards))}
          nextLabel={isLastRound ? 'See results' : 'Next hand'}
          onNext={isLastRound ? onFinish : nextHand}
        />
      )}
    </div>
  )
}
