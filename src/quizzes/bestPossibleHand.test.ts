import { compareHands, evaluateBestHand } from '../domain/hand'
import { BOARD_TEXTURES, boardTexture, possibleHandTiers } from '../domain/bestPossibleHand'
import { seededRng } from '../domain/seededRng'
import { bestPossibleTopic, dealBestPossibleRound } from './bestPossibleHand'
import { PRACTICE_TIPS } from './practiceRun'

const rng = seededRng(11)
const rounds = Array.from({ length: 40 }, () => dealBestPossibleRound(rng))

describe('dealBestPossibleRound', () => {
  it('deals a five-card board with four options and exactly one correct', () => {
    for (const round of rounds) {
      expect(round.board).toHaveLength(5)
      expect(round.options).toHaveLength(4)
      expect(round.options.filter((option) => option.correct)).toHaveLength(1)
      expect(new Set(round.options.map((option) => option.label)).size).toBe(4)
    }
  })

  it('names the real best hand', () => {
    // A sample, since every check tries all 1,081 hole card pairs.
    for (const round of rounds.slice(0, 8)) {
      expect(round.hand).toEqual(possibleHandTiers(round.board)[0][0].hand)
    }
  })

  it('asks both kinds of question', () => {
    expect(rounds.some((round) => round.options[0].holeCards)).toBe(true)
    expect(rounds.some((round) => !round.options[0].holeCards)).toBe(true)
  })

  it('makes sure hole cards matter', () => {
    for (const round of rounds) {
      expect(compareHands(round.hand, evaluateBestHand(round.board))).toBeGreaterThan(0)
    }
  })

  it('sees every texture', () => {
    expect(new Set(rounds.map((round) => boardTexture(round.board))).size).toBe(BOARD_TEXTURES.length)
  })

  it('offers only hole cards that are strictly worse as decoys', () => {
    for (const round of rounds) {
      for (const { holeCards, correct } of round.options) {
        if (!holeCards) continue
        const hand = evaluateBestHand([...round.board, ...holeCards])
        if (correct) expect(compareHands(hand, round.hand)).toBe(0)
        else expect(compareHands(hand, round.hand)).toBeLessThan(0)
      }
    }
  })

  it('offers hole cards that are not on the board', () => {
    for (const round of rounds) {
      const onBoard = round.board.map((card) => `${card.rank}${card.suit}`)
      for (const { holeCards = [] } of round.options) {
        for (const card of holeCards) expect(onBoard).not.toContain(`${card.rank}${card.suit}`)
      }
    }
  })
})

describe('bestPossibleTopic', () => {
  it('gives every texture a topic with a practice tip', () => {
    expect(BOARD_TEXTURES.map(bestPossibleTopic)).toEqual([
      'Paired boards',
      'Flush boards',
      'Straight boards',
      'Dry boards',
    ])
    for (const texture of BOARD_TEXTURES) expect(PRACTICE_TIPS[bestPossibleTopic(texture)]).toBeTruthy()
  })
})
