import { render, screen, within } from '@testing-library/react'
import { RankingsChart } from './RankingsChart'

describe('RankingsChart', () => {
  it('lists all ten hands from strongest to weakest', () => {
    render(<RankingsChart />)
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(10)
    expect(within(rows[0]).getByText('Royal flush')).toBeInTheDocument()
    expect(within(rows[9]).getByText('High card')).toBeInTheDocument()
  })

  it('shows a five-card example for each hand', () => {
    render(<RankingsChart />)
    expect(screen.getAllByLabelText(/^[0-9JQKA]+[♠♥♦♣]$/)).toHaveLength(50)
  })
})
