import { QuestionQuiz, type QuizRound } from '../quizzes/questionQuiz'
import { RULES_QUESTIONS } from '../quizzes/rulesQuestions'
import { QuestionQuizView } from './QuestionQuizView'

type Props = {
  deal?: () => QuizRound
  onAnswered: (topic: string, correct: boolean) => void
  isLastRound?: boolean
  onFinish?: () => void
}

// Lives outside the component so switching tabs doesn't restart the question cycle.
const sessionQuiz = new QuestionQuiz(RULES_QUESTIONS)

export function RulesQuiz({ deal = () => sessionQuiz.next(), ...controls }: Props) {
  return (
    <QuestionQuizView
      intro="Standard no-limit rules. Home games can differ, so agree on house rules before the first hand."
      deal={deal}
      {...controls}
    />
  )
}
