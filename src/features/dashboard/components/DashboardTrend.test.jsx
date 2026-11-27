import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'

import DashboardTrend from './DashboardTrend'

it('offers exact daily counts through a native disclosure and accessible table', async () => {
  const user = userEvent.setup()
  render(
    <DashboardTrend
      activity={{
        hasComparison: true,
        days: [
          { date: '2026-11-25', created: 3, completed: 0 },
          { date: '2026-11-26', created: 1, completed: 2 },
        ],
      }}
    />,
  )
  await user.click(screen.getByText('View daily counts'))
  const table = within(
    screen.getByRole('table', { name: 'Created and completed' }),
  )
  const rows = table.getAllByRole('row')
  expect(rows).toHaveLength(3)
  expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent(
    'Nov 25, 2026',
  )
  expect(
    within(rows[1])
      .getAllByRole('cell')
      .map((cell) => cell.textContent),
  ).toEqual(['3', '0'])
  expect(
    within(rows[2])
      .getAllByRole('cell')
      .map((cell) => cell.textContent),
  ).toEqual(['1', '2'])
  expect(screen.getByText(/Reopening or deleting/)).toBeInTheDocument()
})

it('explains insufficient data instead of displaying a fabricated trend', () => {
  render(<DashboardTrend activity={{ hasComparison: false, days: [] }} />)
  expect(screen.getByText(/at least two different days/)).toBeInTheDocument()
  expect(screen.queryByRole('figure')).not.toBeInTheDocument()
})
