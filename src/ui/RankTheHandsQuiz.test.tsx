import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { HandCategory } from '../domain/hand'
import { STRONGEST_FIRST } from '../quizzes/rankTheHands'
import { RankTheHandsQuiz } from './RankTheHandsQuiz'

const ROW_HEIGHT = 40

const swapTopTwo = (): HandCategory[] => [STRONGEST_FIRST[1], STRONGEST_FIRST[0], ...STRONGEST_FIRST.slice(2)]

const namesIn = (list: HTMLElement) =>
  within(list)
    .getAllByRole('listitem')
    .map((row) => row.querySelector('.rank-name')?.textContent)

const submit = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Submit' }))

function renderQuiz(deal: () => HandCategory[] = swapTopTwo) {
  render(<RankTheHandsQuiz deal={deal} />)
  const list = screen.getByRole('list', { name: 'Your order' })
  // jsdom has no layout, so give the list the height ten rows would take up.
  vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({ top: 0, height: ROW_HEIGHT * 10 } as DOMRect)
  return list
}

/** The middle of the row at this zero-based position. */
const rowY = (position: number) => position * ROW_HEIGHT + ROW_HEIGHT / 2

describe('RankTheHandsQuiz', () => {
  beforeEach(() => {
    // jsdom doesn't implement pointer capture.
    Element.prototype.setPointerCapture = vi.fn()
  })

  it('starts with the dealt order and no answers showing', () => {
    const list = renderQuiz()
    expect(namesIn(list)).toEqual(swapTopTwo().map((hand) => hand[0].toUpperCase() + hand.slice(1)))
    expect(screen.queryByRole('list', { name: 'Correct order' })).not.toBeInTheDocument()
  })

  it('reorders by dragging a row to a new spot', () => {
    const list = renderQuiz()
    fireEvent.pointerDown(list, { clientY: rowY(0), button: 0, pointerId: 1 })
    fireEvent.pointerMove(list, { clientY: rowY(3), pointerId: 1 })
    fireEvent.pointerUp(list, { clientY: rowY(3), pointerId: 1 })
    expect(namesIn(list).slice(0, 4)).toEqual(['Royal flush', 'Four of a kind', 'Full house', 'Straight flush'])
  })

  it('keeps a dragged row on the list when the pointer leaves it', () => {
    const list = renderQuiz()
    fireEvent.pointerDown(list, { clientY: rowY(1), button: 0, pointerId: 1 })
    fireEvent.pointerMove(list, { clientY: rowY(40), pointerId: 1 })
    expect(namesIn(list)[9]).toBe('Royal flush')
  })

  it('stops following the pointer once the row is dropped', () => {
    const list = renderQuiz()
    fireEvent.pointerDown(list, { clientY: rowY(0), button: 0, pointerId: 1 })
    fireEvent.pointerUp(list, { clientY: rowY(0), pointerId: 1 })
    fireEvent.pointerMove(list, { clientY: rowY(5), pointerId: 1 })
    expect(namesIn(list)[0]).toBe('Straight flush')
  })

  it('ignores the right mouse button', () => {
    const list = renderQuiz()
    fireEvent.pointerDown(list, { clientY: rowY(0), button: 2, pointerId: 1 })
    fireEvent.pointerMove(list, { clientY: rowY(5), pointerId: 1 })
    expect(namesIn(list)[0]).toBe('Straight flush')
  })

  it('reorders from the keyboard and keeps focus on the moved hand', async () => {
    const user = userEvent.setup()
    const list = renderQuiz()
    screen.getByRole('button', { name: /^Move Royal flush/ }).focus()

    await user.keyboard('{ArrowUp}')

    expect(namesIn(list)[0]).toBe('Royal flush')
    expect(screen.getByRole('button', { name: /^Move Royal flush/ })).toHaveFocus()
  })

  it('marks hands right and wrong and shows the correct order beside them', async () => {
    const user = userEvent.setup()
    const list = renderQuiz()
    await submit(user)

    const correct = screen.getByRole('list', { name: 'Correct order' })
    expect(namesIn(correct)[0]).toBe('Royal flush')
    expect(namesIn(correct)[9]).toBe('High card')

    const rows = within(list).getAllByRole('listitem')
    expect(rows[0]).toHaveClass('rank-row-wrong')
    expect(within(rows[0]).getByLabelText('Wrong spot')).toBeInTheDocument()
    expect(rows[2]).toHaveClass('rank-row-right')
    expect(within(rows[2]).getByLabelText('Right spot')).toBeInTheDocument()
    expect(screen.getByText('Not quite.')).toBeInTheDocument()
    expect(screen.getByText('8 of 10 in the right spot.')).toBeInTheDocument()
  })

  it('confirms a fully correct order', async () => {
    const user = userEvent.setup()
    renderQuiz(() => [...STRONGEST_FIRST])
    await submit(user)
    expect(screen.getByText('Correct!')).toBeInTheDocument()
    expect(screen.getByText('10 of 10 in the right spot.')).toBeInTheDocument()
  })

  it('stops asking for a drag once the order is locked', async () => {
    const user = userEvent.setup()
    renderQuiz()
    expect(screen.getByText(/Drag the hands/)).toBeInTheDocument()
    await submit(user)
    expect(screen.queryByText(/Drag the hands/)).not.toBeInTheDocument()
  })

  it('locks the order after submitting', async () => {
    const user = userEvent.setup()
    const list = renderQuiz()
    await submit(user)

    fireEvent.pointerDown(list, { clientY: rowY(0), button: 0, pointerId: 1 })
    fireEvent.pointerMove(list, { clientY: rowY(5), pointerId: 1 })

    expect(namesIn(list)[0]).toBe('Straight flush')
    expect(screen.queryByRole('button', { name: /^Move / })).not.toBeInTheDocument()
  })

  it('shows what each hand looks like after submitting', async () => {
    const user = userEvent.setup()
    renderQuiz()
    expect(screen.queryByRole('heading', { name: 'What each hand looks like' })).not.toBeInTheDocument()
    await submit(user)
    expect(screen.getByRole('heading', { name: 'What each hand looks like' })).toBeInTheDocument()
    expect(screen.getByText('Five of one suit, in any order.')).toBeInTheDocument()
  })

  it('deals a new order when trying again', async () => {
    const user = userEvent.setup()
    const deal = vi.fn(swapTopTwo)
    renderQuiz(deal)
    await submit(user)

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(deal).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('list', { name: 'Correct order' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })
})
