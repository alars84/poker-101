export type TopicScore = { readonly topic: string; readonly correct: number; readonly attempts: number }

/** Immutable: recording returns a new score card, which suits React state. */
export class ScoreCard {
  readonly #scores: readonly TopicScore[]

  constructor(scores: readonly TopicScore[] = []) {
    this.#scores = scores
  }

  record(topic: string, correct: boolean): ScoreCard {
    const existing = this.#scores.find((score) => score.topic === topic)
    const updated = {
      topic,
      correct: (existing?.correct ?? 0) + (correct ? 1 : 0),
      attempts: (existing?.attempts ?? 0) + 1,
    }
    return new ScoreCard(
      existing
        ? this.#scores.map((score) => (score === existing ? updated : score))
        : [...this.#scores, updated],
    )
  }

  topics(): readonly TopicScore[] {
    return this.#scores
  }

  total(): { correct: number; attempts: number } {
    return {
      correct: this.#scores.reduce((sum, score) => sum + score.correct, 0),
      attempts: this.#scores.reduce((sum, score) => sum + score.attempts, 0),
    }
  }
}
