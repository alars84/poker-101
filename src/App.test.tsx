import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const tab = (name: string) => screen.getByRole('button', { name })

describe('App', () => {
  it('opens on the Who Wins? drill', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Lock it in' })).toBeInTheDocument()
  })

  it('switches between the drills and the rankings', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(tab('Rankings'))
    expect(screen.getByText('Royal flush')).toBeInTheDocument()

    await user.click(tab('Name the Hand'))
    expect(tab('Full house')).toBeInTheDocument()
  })

  it('opens the rules quiz', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(tab('Rules Quiz'))

    expect(screen.getByText(/house rules/)).toBeInTheDocument()
  })

  it('keeps the session score across drills', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(tab('Name the Hand'))
    await user.click(tab('Pair'))
    await user.click(tab('Who Wins?'))

    expect(screen.getByText('Name the hand')).toBeInTheDocument()
    expect(screen.getByText(/of 1 correct/)).toBeInTheDocument()
  })
})
