import type { DailyChallenge } from '../quizzes/dailyChallenge'
import { dealBestPossibleRound } from '../quizzes/bestPossibleHand'
import { dealNameTheHandRound } from '../quizzes/nameTheHand'
import { dealOpenOrFoldRound } from '../quizzes/openOrFold'
import { dealOutsRound } from '../quizzes/outsAndOdds'
import { dealWhoWinsRound } from '../quizzes/whoWins'
import { BestPossibleHandQuiz } from './BestPossibleHandQuiz'
import { NameTheHandQuiz } from './NameTheHandQuiz'
import { OpenOrFoldQuiz } from './OpenOrFoldQuiz'
import { OutsAndOddsQuiz } from './OutsAndOddsQuiz'
import type { RunControls } from './RunScreen'
import { WhoWinsQuiz } from './WhoWinsQuiz'

type Props = RunControls & { challenge: DailyChallenge }

export function DailyQuiz({ challenge, ...controls }: Props) {
  switch (challenge.quiz) {
    case 'who-wins':
      return <WhoWinsQuiz deal={() => dealWhoWinsRound(challenge.currentDeal)} {...controls} />
    case 'name-the-hand':
      return <NameTheHandQuiz deal={() => dealNameTheHandRound(challenge.currentDeal)} {...controls} />
    case 'best-possible-hand':
      return <BestPossibleHandQuiz deal={() => dealBestPossibleRound(challenge.currentDeal)} {...controls} />
    case 'open-or-fold':
      return <OpenOrFoldQuiz deal={() => dealOpenOrFoldRound(challenge.currentDeal)} {...controls} />
    case 'outs-and-odds':
      return <OutsAndOddsQuiz deal={() => dealOutsRound(challenge.currentDeal)} {...controls} />
  }
}
