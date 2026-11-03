import { shuffled, type Rng } from '../domain/deck'
import { RULES_QUESTIONS } from './rulesQuestions'

export type RulesQuestion = {
  readonly topic: string
  readonly prompt: string
  readonly answer: string
  readonly wrong: readonly string[]
  readonly explanation: string
}

export type QuizRound = {
  readonly question: RulesQuestion
  readonly options: readonly string[]
}

export class RulesQuiz {
  readonly #questions: readonly RulesQuestion[]
  readonly #rng: Rng
  #remaining: RulesQuestion[] = []
  #last: RulesQuestion | null = null

  constructor(questions: readonly RulesQuestion[] = RULES_QUESTIONS, rng: Rng = Math.random) {
    this.#questions = questions
    this.#rng = rng
  }

  next(): QuizRound {
    if (this.#remaining.length === 0) this.#reshuffle()
    const question = this.#remaining.shift()!
    this.#last = question
    return {
      question,
      options: shuffled([question.answer, ...question.wrong], this.#rng),
    }
  }

  #reshuffle() {
    this.#remaining = shuffled(this.#questions, this.#rng)
    // A fresh shuffle could start with the question just asked.
    if (this.#remaining[0] === this.#last) this.#remaining.push(this.#remaining.shift()!)
  }
}

export function isCorrectOption(round: QuizRound, option: string): boolean {
  return round.question.answer === option
}
