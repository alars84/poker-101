import { shuffled, type Rng } from '../domain/deck'

export type QuizQuestion = {
  readonly topic: string
  readonly prompt: string
  readonly answer: string
  readonly wrong: readonly string[]
  readonly explanation: string
}

export type QuizRound = {
  readonly question: QuizQuestion
  readonly options: readonly string[]
}

export class QuestionQuiz {
  readonly #questions: readonly QuizQuestion[]
  readonly #rng: Rng
  #remaining: QuizQuestion[] = []
  #last: QuizQuestion | null = null

  constructor(questions: readonly QuizQuestion[], rng: Rng = Math.random) {
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
