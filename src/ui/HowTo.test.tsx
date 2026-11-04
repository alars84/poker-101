import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { HOW_TO_SECTIONS } from '../howTo/sections'
import { HowToIndex, HowToSectionView } from './HowTo'

const section = (id: string) => {
  const found = HOW_TO_SECTIONS.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`No section ${id}`)
  return found
}

describe('HowToIndex', () => {
  it('lists the sections under the same groups as the quizzes', () => {
    render(<HowToIndex onOpenSection={() => {}} onExit={() => {}} />)
    const group = within(screen.getByRole('region', { name: 'Make the play' }))
    expect(group.getByRole('heading', { name: 'Outs and odds' })).toBeInTheDocument()
    expect(group.queryByRole('heading', { name: 'Hand rankings' })).not.toBeInTheDocument()
  })

  it('opens a section', async () => {
    const user = userEvent.setup()
    const onOpenSection = vi.fn()
    render(<HowToIndex onOpenSection={onOpenSection} onExit={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Read Outs and odds' }))

    expect(onOpenSection).toHaveBeenCalledExactlyOnceWith('outs-and-odds')
  })
})

describe('HowToSectionView', () => {
  const renderSection = (id: string, onPractice = () => {}, onExit = () => {}) =>
    render(<HowToSectionView section={section(id)} onPractice={onPractice} onExit={onExit} />)

  it('shows the title and each point', () => {
    renderSection('outs-and-odds')
    expect(screen.getByRole('heading', { level: 1, name: 'Outs and odds' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What counts as an out' })).toBeInTheDocument()
  })

  it('ends with a way to practice that section', async () => {
    const user = userEvent.setup()
    const onPractice = vi.fn()
    renderSection('outs-and-odds', onPractice)

    await user.click(screen.getByRole('button', { name: 'Practice this' }))

    expect(onPractice).toHaveBeenCalledExactlyOnceWith('outs-and-odds')
  })

  it('shows the rankings chart in the hand rankings section', () => {
    renderSection('hand-rankings')
    expect(screen.getByRole('heading', { name: 'Royal flush' })).toBeInTheDocument()
  })

  it('leaves the chart out of other sections', () => {
    renderSection('outs-and-odds')
    expect(screen.queryByRole('heading', { name: 'Royal flush' })).not.toBeInTheDocument()
  })

  it('goes back to the list', async () => {
    const user = userEvent.setup()
    const onExit = vi.fn()
    renderSection('outs-and-odds', () => {}, onExit)

    await user.click(screen.getByRole('button', { name: 'Back to How To' }))

    expect(onExit).toHaveBeenCalledOnce()
  })
})
