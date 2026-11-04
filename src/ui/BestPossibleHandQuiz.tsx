import { useState } from 'react'
import { boardTexture } from '../domain/bestPossibleHand'
import { explainBestPossibleHand } from '../domain/explanation'
import { bestPossibleTopic, dealBestPossibleRound, type BestPossibleOption } from '../quizzes/bestPossibleHand'
import { CardRow } from './CardView'
import { Feedback } from './Feedback'

type Props = {
  deal?: typeof dealBestPossibleRound
  onAnswered: (topic: string, correct: boolean) => void
  isLastRound?: boolean
  onFinish?: () => void
}

export function BestPossibleHandQuiz({
  deal = dealBestPossibleRound,
  onAnswered,
  isLastRound = false,
  onFinish,
}: Props) {
  const [round, setRound] = useState(() => deal())
  const [answer, setAnswer] = useState<BestPossibleOption | null>(null)

  const texture = boardTexture(round.board)

  const choose = (option: BestPossibleOption) => {
    setAnswer(option)
    onAnswered(bestPossibleTopic(texture), option.correct)
  }
  const nextBoard = () => {
    setRound(deal())
    setAnswer(null)
  }

  return (
    <div className="quiz">
      <p className="prompt">{round.prompt}</p>

      <section className="board" aria-label="Board">
        <CardRow cards={round.board} />
      </section>

      <div className="options">
        {round.options.map((option) => (
          <button
            type="button"
            key={option.label}
            aria-label={option.label}
            className={`option ${answer === option ? 'option-chosen' : ''} ${
              answer && option.correct ? 'option-right' : ''
            }`}
            disabled={answer !== null}
            onClick={() => choose(option)}
          >
            {option.holeCards ? <CardRow cards={option.holeCards} /> : option.label}
          </button>
        ))}
      </div>

      {answer && (
        <Feedback
          correct={answer.correct}
          message={explainBestPossibleHand(round.hand, round.holeCards, texture)}
          nextLabel={isLastRound ? 'See results' : 'Next board'}
          onNext={isLastRound ? onFinish : nextBoard}
        />
      )}
    </div>
  )
}
