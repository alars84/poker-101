import { seededRng } from '../testing/seededRng'
import { isCorrectOption, RulesQuiz, type RulesQuestion } from './rulesQuiz'
import { RULES_QUESTIONS, RULES_TOPICS } from './rulesQuestions'

const question = (prompt: string): RulesQuestion => ({
  topic: 'Blinds',
  prompt,
  answer: `${prompt} answer`,
  wrong: [`${prompt} wrong 1`, `${prompt} wrong 2`],
  explanation: `${prompt} because`,
})

const bank = ['one', 'two', 'three', 'four'].map(question)

describe('RulesQuiz', () => {
  it('asks every question once before repeating any', () => {
    const quiz = new RulesQuiz(bank, seededRng(3))
    const asked = bank.map(() => quiz.next().question.prompt)
    expect([...asked].sort()).toEqual(['four', 'one', 'three', 'two'])
  })

  it('never asks the same question twice in a row, even after running out', () => {
    for (let seed = 0; seed < 50; seed++) {
      const quiz = new RulesQuiz(bank, seededRng(seed))
      const asked = Array.from({ length: 40 }, () => quiz.next().question.prompt)
      expect(asked.some((prompt, i) => prompt === asked[i - 1])).toBe(false)
    }
  })

  it('offers the answer among the options, in a shuffled spot', () => {
    const quiz = new RulesQuiz(bank, seededRng(8))
    const spots = new Set<number>()
    for (let i = 0; i < 40; i++) {
      const { question, options } = quiz.next()
      expect(options).toHaveLength(3)
      spots.add(options.indexOf(question.answer))
    }
    expect(spots.size).toBe(3)
  })
})

describe('isCorrectOption', () => {
  it('accepts only the answer', () => {
    const round = new RulesQuiz(bank, seededRng(1)).next()
    expect(isCorrectOption(round, round.question.answer)).toBe(true)
    expect(isCorrectOption(round, round.question.wrong[0])).toBe(false)
  })
})

describe('the question bank', () => {
  it('covers every topic', () => {
    for (const topic of RULES_TOPICS) {
      expect(RULES_QUESTIONS.filter((q) => q.topic === topic).length).toBeGreaterThanOrEqual(4)
    }
  })

  it('has no repeated prompts', () => {
    expect(new Set(RULES_QUESTIONS.map((q) => q.prompt)).size).toBe(RULES_QUESTIONS.length)
  })

  it.each(RULES_QUESTIONS.map((q) => [q.prompt, q] as const))('"%s" has distinct options', (_, q) => {
    expect(q.wrong.length).toBeGreaterThanOrEqual(2)
    expect(new Set([q.answer, ...q.wrong]).size).toBe(q.wrong.length + 1)
    expect(q.explanation).not.toBe('')
  })
})
