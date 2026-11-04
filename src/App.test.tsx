import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { quizForDate } from './quizzes/dailyChallenge'
import { RULES_QUESTIONS } from './quizzes/rulesQuestions'

const button = (name: string | RegExp) => screen.getByRole('button', { name })
const progress = () => screen.getByRole('progressbar')
const isRightRulesAnswer = (option: string) => RULES_QUESTIONS.some(({ answer }) => answer === option)

function open() {
  render(<App />)
  return userEvent.setup()
}

/** A day whose challenge is Name the Hand, which can be answered with one tap. */
const NAME_THE_HAND_DAY = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'].find(
  (date) => quizForDate(date) === 'name-the-hand',
)!

const setToday = (date: string) => vi.setSystemTime(new Date(`${date}T12:00:00`))

const boardShown = () => screen.getByRole('region', { name: 'Board' }).textContent

async function answerTenDailyRounds(user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < 9; i++) {
    await user.click(button('Pair'))
    await user.click(button('Next hand'))
  }
  await user.click(button('Pair'))
  await user.click(button('See results'))
}

describe('App', () => {
  beforeEach(() => {
    window.location.hash = ''
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
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

  it('keeps your score on the home page across quizzes', async () => {
    const user = open()

    await user.click(button('Start Name the Hand'))
    await user.click(button('Pair'))
    expect(screen.queryByText(/Your score/)).not.toBeInTheDocument()

    await user.click(button('Exit'))
    expect(screen.getByText(/Your score: \d of 1 correct/)).toBeVisible()
  })

  it('remembers your score and your place after a reload', async () => {
    const user = open()
    await user.click(button('Start Name the Hand'))
    await user.click(button('Pair'))
    await user.click(button('Exit'))
    cleanup()

    open()

    expect(button('Resume (1 of 10) Name the Hand')).toBeVisible()
    expect(screen.getByText(/Your score: \d of 1 correct/)).toBeVisible()
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

  it('reads a How To section from home, then practices it', async () => {
    const user = open()

    await user.click(button('Open How To'))
    await user.click(button('Read Outs and odds'))
    expect(screen.getByRole('heading', { level: 1, name: 'Outs and odds' })).toBeVisible()

    await user.click(button('Practice this'))
    expect(screen.getByRole('heading', { level: 1, name: 'Outs and Odds' })).toBeVisible()
    expect(progress()).toBeVisible()
  })

  it('walks back from a How To section to home', async () => {
    const user = open()
    await user.click(button('Open How To'))
    await user.click(button('Read Hand rankings'))

    await user.click(button('Back to How To'))
    await user.click(button('Back to home'))

    expect(button('Start Who Wins?')).toBeVisible()
  })

  it('opens a How To section named in the URL', () => {
    window.location.hash = '#how-to/starting-hands'
    open()
    expect(screen.getByRole('heading', { level: 1, name: 'Starting hands' })).toBeVisible()
  })

  it('falls back to home for a How To section it does not know', () => {
    window.location.hash = '#how-to/nonsense'
    open()
    expect(button('Start Who Wins?')).toBeVisible()
  })

  it('links a missed topic in the summary to its How To section', async () => {
    const user = open()
    await user.click(button('Start Rules Quiz'))
    const wrongOption = () =>
      screen
        .getAllByRole('button')
        .filter((candidate) => candidate.classList.contains('option'))
        .find((candidate) => !isRightRulesAnswer(candidate.textContent ?? ''))!

    for (let i = 0; i < 9; i++) {
      await user.click(wrongOption())
      await user.click(button('Next question'))
    }
    await user.click(wrongOption())
    await user.click(button('See results'))

    await user.click(screen.getAllByRole('button', { name: /^Read up:/ })[0])
    expect(button('Practice this')).toBeVisible()
  })

  describe('the daily challenge', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      setToday(NAME_THE_HAND_DAY)
    })

    it('deals everyone the same hands', async () => {
      const user = open()
      await user.click(button('Start Daily Challenge'))
      const firstBoard = boardShown()
      await user.click(button('Pair'))
      await user.click(button('Next hand'))
      const secondBoard = boardShown()
      expect(secondBoard).not.toBe(firstBoard)

      cleanup()
      localStorage.clear()
      window.location.hash = ''
      const otherPlayer = open()
      await otherPlayer.click(button('Start Daily Challenge'))
      expect(boardShown()).toBe(firstBoard)
      await otherPlayer.click(button('Pair'))
      await otherPlayer.click(button('Next hand'))
      expect(boardShown()).toBe(secondBoard)
    })

    it('deals the same hand again if you leave and come back', async () => {
      const user = open()
      await user.click(button('Start Daily Challenge'))
      const board = boardShown()

      await user.click(button('Exit'))
      await user.click(button('Start Daily Challenge'))

      expect(boardShown()).toBe(board)
    })

    it('adds to your score like any other quiz', async () => {
      const user = open()
      await user.click(button('Start Daily Challenge'))
      await user.click(button('Pair'))
      await user.click(button('Exit'))
      expect(screen.getByText(/Your score: \d of 1 correct/)).toBeVisible()
    })

    it('gives one try a day, even after a reload', async () => {
      const user = open()
      await user.click(button('Start Daily Challenge'))
      await answerTenDailyRounds(user)
      expect(screen.getByRole('heading', { name: /^\d+ of 10 correct$/ })).toBeVisible()
      expect(screen.queryByRole('button', { name: 'Practice again' })).not.toBeInTheDocument()

      await user.click(button('Back to home'))
      cleanup()
      const reloaded = open()

      await reloaded.click(button('See result Daily Challenge'))
      expect(screen.getByRole('heading', { name: /^\d+ of 10 correct$/ })).toBeVisible()
    })

    it('copies a result to paste into the group chat', async () => {
      const user = open()
      await user.click(button('Start Daily Challenge'))
      await answerTenDailyRounds(user)

      await user.click(button('Copy result'))

      expect(await navigator.clipboard.readText()).toContain(`Poker 101 Daily, ${NAME_THE_HAND_DAY}`)
      expect(button('Copied!')).toBeVisible()
    })

    it('starts over on a new day', async () => {
      const user = open()
      await user.click(button('Start Daily Challenge'))
      await answerTenDailyRounds(user)
      await user.click(button('Back to home'))
      cleanup()

      setToday('2026-12-01')
      open()

      expect(button('Start Daily Challenge')).toBeVisible()
    })

    it('picks up the new day when you come back to a tab left open overnight', async () => {
      const user = open()
      await user.click(button('Start Daily Challenge'))
      await user.click(button('Pair'))
      await user.click(button('Exit'))
      expect(button('Resume (1 of 10) Daily Challenge')).toBeVisible()

      setToday('2026-12-01')
      fireEvent(document, new Event('visibilitychange'))

      expect(await screen.findByRole('button', { name: 'Start Daily Challenge' })).toBeVisible()
    })

    it.each(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'])(
      'plays the challenge for %s',
      (date) => {
        setToday(date)
        window.location.hash = '#daily'
        open()
        expect(screen.getByRole('heading', { level: 1, name: /^Daily Challenge: \S/ })).toBeVisible()
        expect(progress()).toHaveAttribute('aria-valuenow', '0')
      },
    )

    it('opens from a shared link', () => {
      window.location.hash = '#daily'
      open()
      expect(screen.getByRole('progressbar')).toBeVisible()
    })
  })

  it('starts a new screen at the top of the page', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo')
    const user = open()
    scrollTo.mockClear()

    await user.click(button('Start Rules Quiz'))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })
})
