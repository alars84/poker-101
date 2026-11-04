import { PRACTICE_TIPS } from '../quizzes/practiceRun'
import { GROUP_TITLES } from '../quizzes/quizCatalog'
import { HOW_TO_SECTIONS, sectionForTopic } from './sections'

describe('How To sections', () => {
  it('gives every section its own id', () => {
    const ids = HOW_TO_SECTIONS.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers every topic a quiz can flag as a miss, exactly once', () => {
    const covered = HOW_TO_SECTIONS.flatMap((section) => section.topics)
    expect(covered.toSorted()).toEqual(Object.keys(PRACTICE_TIPS).toSorted())
  })

  it('has something to read in every group', () => {
    for (const group of GROUP_TITLES) {
      expect(HOW_TO_SECTIONS.some((section) => section.group === group)).toBe(true)
    }
  })

  it('finds the section that teaches a topic', () => {
    expect(sectionForTopic('Kicker')?.id).toBe('comparing-hands')
    expect(sectionForTopic('Pot odds')?.id).toBe('outs-and-odds')
  })

  it('finds nothing for a topic no section teaches', () => {
    expect(sectionForTopic('Juggling')).toBeUndefined()
  })
})
