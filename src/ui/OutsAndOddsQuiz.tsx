import { useState } from 'react'
import { dealOutsRound, type OutsOption } from '../quizzes/outsAndOdds'
import { CardRow } from './CardView'
import { Feedback } from './Feedback'

type Props = {
  deal?: typeof dealOutsRound
  onAnswered: (topic: string, correct: boolean) => void
  isLastRound?: boolean
  onFinish?: () => void
}

export function OutsAndOddsQuiz({ deal = dealOutsRound, onAnswered, isLastRound = false, onFinish }: Props) {
  const [round, setRound] = useState(() => deal())
  const [answer, setAnswer] = useState<OutsOption | null>(null)

  const choose = (option: OutsOption) => {
    setAnswer(option)
    onAnswered(round.topic, option.correct)
  }
  const nextHand = () => {
    setRound(deal())
    setAnswer(null)
  }

  return (
    <div className="quiz">
      <p className="prompt">Assume you're behind, your outs win, and nothing else does. Ignore future bets.</p>

      <section className="question">
        <p className="question-topic">{round.topic}</p>
        <p className="question-prompt">{round.prompt}</p>
      </section>

      <section className="board" aria-label="Board">
        <CardRow cards={round.board} />
      </section>
      <section className="hole-cards" aria-label="Your hole cards">
        <CardRow cards={round.holeCards} />
      </section>

      <div className="options">
        {round.options.map((option) => (
          <button
            type="button"
            key={option.label}
            className={`option ${answer === option ? 'option-chosen' : ''} ${
              answer && option.correct ? 'option-right' : ''
            }`}
            disabled={answer !== null}
            onClick={() => choose(option)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {answer && (
        <>
          <section className="hole-cards" aria-label="Your outs">
            <CardRow cards={round.outs} />
          </section>
          <Feedback
            correct={answer.correct}
            message={round.explanation}
            nextLabel={isLastRound ? 'See results' : 'Next hand'}
            onNext={isLastRound ? onFinish : nextHand}
          />
        </>
      )}
    </div>
  )
}
