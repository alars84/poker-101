import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'

const button = (name: string | RegExp) => screen.getByRole('button', { name })
const progress = () => screen.getByRole('progressbar')

function open() {
  render(<App />)
  return userEvent.setup()
}

describe('App', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('opens on the home page with no quiz showing', () => {
    open()
    expect(screen.getByRole('heading', { name: 'Want to practice your poker skills?' })).toBeVisible()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lock it in' })).not.toBeInTheDocument()
  })

  it('starts each quiz from its card', async () => {
    const user = open()

    await user.click(button('Start Who Wins?'))
    expect(button('Lock it in')).toBeVisible()

    await user.click(button('Exit'))
    await user.click(button('Start Name the Hand'))
    expect(button('Full house')).toBeVisible()

    await user.click(button('Exit'))
    await user.click(button('Start Rules Quiz'))
    expect(screen.getByText(/house rules/)).toBeVisible()

    await user.click(button('Exit'))
    await user.click(button('Start Open or Fold'))
    expect(button('Raise')).toBeVisible()

    await user.click(button('Exit'))
    await user.click(button('Start Best Possible Hand'))
    expect(screen.getByText(/^(What is|Which hole cards make) the best possible hand/)).toBeVisible()

    await user.click(button('Exit'))
    await user.click(button('Start Outs and Odds'))
    expect(screen.getByText(/nothing else does/)).toBeVisible()

    await user.click(button('Exit'))
    await user.click(button('Start Read the Player'))
    expect(screen.getByText(/tendencies, not rules/)).toBeVisible()
  })

  it('groups every quiz on the home page', () => {
    open()
    const titlesIn = (group: string) =>
      within(screen.getByRole('region', { name: group }))
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)

    expect(titlesIn('Know the game')).toEqual(['Hand Rankings Quiz', 'Rules Quiz'])
    expect(titlesIn('Read the cards')).toEqual(['Name the Hand', 'Who Wins?', 'Best Possible Hand'])
    expect(titlesIn('Make the play')).toEqual(['Open or Fold', 'Outs and Odds', 'Read the Player'])
  })

  it('hides the home page during a quiz', async () => {
    const user = open()
    await user.click(button('Start Rules Quiz'))
    expect(screen.queryByRole('heading', { name: 'Want to practice your poker skills?' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Start/ })).not.toBeInTheDocument()
  })

  it('opens the rankings quiz from home and comes back', async () => {
    const user = open()

    await user.click(button('Start Hand Rankings Quiz'))
    expect(screen.getByRole('heading', { level: 1, name: 'Hand Rankings Quiz' })).toBeVisible()
    expect(button('Submit')).toBeVisible()

    await user.click(button('Back to home'))
    expect(button('Start Who Wins?')).toBeVisible()
  })

  it('offers to resume after exiting a run, and keeps its place', async () => {
    const user = open()

    await user.click(button('Start Name the Hand'))
    await user.click(button('Pair'))
    await user.click(button('Exit'))
    await user.click(button('Resume (1 of 10) Name the Hand'))

    expect(progress()).toHaveAttribute('aria-valuenow', '1')
  })

  it('keeps the session score on the home page across quizzes', async () => {
    const user = open()

    await user.click(button('Start Name the Hand'))
    await user.click(button('Pair'))
    expect(screen.queryByText(/This session/)).not.toBeInTheDocument()

    await user.click(button('Exit'))
    expect(screen.getByText(/This session: \d of 1 correct/)).toBeVisible()
  })

  it('takes a whole rules quiz through to its summary, then home', async () => {
    const user = open()
    await user.click(button('Start Rules Quiz'))
    const firstOption = () => screen.getAllByRole('button')[1]

    for (let i = 0; i < 9; i++) {
      await user.click(firstOption())
      await user.click(button('Next question'))
    }
    await user.click(firstOption())
    await user.click(button('See results'))
    expect(screen.getByRole('heading', { name: /^\d+ of 10 correct$/ })).toBeVisible()

    await user.click(button('Back to home'))
    await user.click(button('Start Rules Quiz'))
    expect(progress()).toHaveAttribute('aria-valuenow', '0')
  })

  it('comes home on the browser back button without losing the run', async () => {
    const user = open()
    await user.click(button('Start Name the Hand'))
    await user.click(button('Pair'))

    window.location.hash = ''

    expect(await screen.findByRole('button', { name: /^Resume \(1 of 10\)/ })).toBeVisible()
  })

  it('opens the screen named in the URL', () => {
    window.location.hash = '#rankings'
    open()
    expect(button('Submit')).toBeVisible()
  })

  it('falls back to home for a URL it does not know', () => {
    window.location.hash = '#nonsense'
    open()
    expect(button('Start Who Wins?')).toBeVisible()
  })

  it('starts a new screen at the top of the page', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo')
    const user = open()
    scrollTo.mockClear()

    await user.click(button('Start Rules Quiz'))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })
})
