import { seededRng } from '../domain/seededRng'
import { isCorrectOption, QuestionQuiz, type QuizQuestion } from './questionQuiz'
import { PLAYER_QUESTIONS, PLAYER_TOPICS } from './playerQuestions'
import { PRACTICE_TIPS } from './practiceRun'
import { RULES_QUESTIONS, RULES_TOPICS } from './rulesQuestions'

const question = (prompt: string): QuizQuestion => ({
  topic: 'Blinds',
  prompt,
  answer: `${prompt} answer`,
  wrong: [`${prompt} wrong 1`, `${prompt} wrong 2`],
  explanation: `${prompt} because`,
})

const bank = ['one', 'two', 'three', 'four'].map(question)

describe('QuestionQuiz', () => {
  it('asks every question once before repeating any', () => {
    const quiz = new QuestionQuiz(bank, seededRng(3))
    const asked = bank.map(() => quiz.next().question.prompt)
    expect([...asked].sort()).toEqual(['four', 'one', 'three', 'two'])
  })

  it('never asks the same question twice in a row, even after running out', () => {
    for (let seed = 0; seed < 50; seed++) {
      const quiz = new QuestionQuiz(bank, seededRng(seed))
      const asked = Array.from({ length: 40 }, () => quiz.next().question.prompt)
      expect(asked.some((prompt, i) => prompt === asked[i - 1])).toBe(false)
    }
  })

  it('offers the answer among the options, in a shuffled spot', () => {
    const quiz = new QuestionQuiz(bank, seededRng(8))
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
    const round = new QuestionQuiz(bank, seededRng(1)).next()
    expect(isCorrectOption(round, round.question.answer)).toBe(true)
    expect(isCorrectOption(round, round.question.wrong[0])).toBe(false)
  })
})

describe.each([
  ['rules', RULES_QUESTIONS, RULES_TOPICS],
  ['player', PLAYER_QUESTIONS, PLAYER_TOPICS],
] as const)('the %s question bank', (_, questions, topics) => {
  it('covers every topic', () => {
    for (const topic of topics) {
      expect(questions.filter((q) => q.topic === topic).length).toBeGreaterThanOrEqual(4)
    }
  })

  it('has no repeated prompts', () => {
    expect(new Set(questions.map((q) => q.prompt)).size).toBe(questions.length)
  })

  it('gives every topic a practice tip', () => {
    for (const topic of topics) expect(PRACTICE_TIPS[topic]).toBeTruthy()
  })

  it.each(questions.map((q) => [q.prompt, q] as const))('"%s" has distinct options', (_, q) => {
    expect(q.wrong.length).toBeGreaterThanOrEqual(2)
    expect(new Set([q.answer, ...q.wrong]).size).toBe(q.wrong.length + 1)
    expect(q.explanation).not.toBe('')
  })
})
