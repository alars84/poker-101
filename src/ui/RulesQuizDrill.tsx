import { useState } from 'react'
import { isCorrectOption, RulesQuiz, type QuizRound } from '../drills/rulesQuiz'
import { Feedback } from './Feedback'

type Props = {
  deal?: () => QuizRound
  onAnswered: (topic: string, correct: boolean) => void
  isLastRound?: boolean
  onFinish?: () => void
}

// Lives outside the component so switching tabs doesn't restart the question cycle.
const sessionQuiz = new RulesQuiz()

export function RulesQuizDrill({ deal = () => sessionQuiz.next(), onAnswered, isLastRound = false, onFinish }: Props) {
  const [round, setRound] = useState(() => deal())
  const [answer, setAnswer] = useState<string | null>(null)

  const { question, options } = round

  const choose = (option: string) => {
    setAnswer(option)
    onAnswered(question.topic, isCorrectOption(round, option))
  }
  const nextQuestion = () => {
    setRound(deal())
    setAnswer(null)
  }

  return (
    <div className="drill">
      <p className="prompt">Standard no-limit rules. Home games can differ, so agree on house rules before the first hand.</p>

      <section className="question">
        <p className="question-topic">{question.topic}</p>
        <p className="question-prompt">{question.prompt}</p>
      </section>

      <div className="options options-list">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={`option ${answer === option ? 'option-chosen' : ''} ${
              answer && isCorrectOption(round, option) ? 'option-right' : ''
            }`}
            disabled={answer !== null}
            onClick={() => choose(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {answer && (
        <Feedback
          correct={isCorrectOption(round, answer)}
          message={question.explanation}
          nextLabel={isLastRound ? 'See results' : 'Next question'}
          onNext={isLastRound ? onFinish : nextQuestion}
        />
      )}
    </div>
  )
}
