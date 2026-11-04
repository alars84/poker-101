import { PLAYER_QUESTIONS } from '../quizzes/playerQuestions'
import { QuestionQuiz, type QuizRound } from '../quizzes/questionQuiz'
import { QuestionQuizView } from './QuestionQuizView'

type Props = {
  deal?: () => QuizRound
  onAnswered: (topic: string, correct: boolean) => void
  isLastRound?: boolean
  onFinish?: () => void
}

// Lives outside the component so switching tabs doesn't restart the question cycle.
const sessionQuiz = new QuestionQuiz(PLAYER_QUESTIONS)

export function ReadThePlayerQuiz({ deal = () => sessionQuiz.next(), ...controls }: Props) {
  return (
    <QuestionQuizView
      intro="These are usual tendencies, not rules. Players vary, so keep watching what yours actually do."
      deal={deal}
      {...controls}
    />
  )
}
