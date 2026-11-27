import { useState } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import i18n from '@/i18n'

import { DatePicker } from './date-picker'

function Picker({ initial = '2028-02-28', onChange = () => {} }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <label htmlFor="due">Due date</label>
      <DatePicker
        id="due"
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
      <output aria-label="Stored date">{value}</output>
    </>
  )
}

it('selects a leap day with the keyboard and returns the canonical date and trigger focus', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<Picker onChange={onChange} />)
  const trigger = screen.getByRole('button', { name: 'Due date' })
  expect(trigger).toHaveTextContent('Feb 28, 2028')
  await user.click(trigger)
  const selected = await screen.findByRole('button', {
    name: /February 28th, 2028/,
  })
  selected.focus()
  await user.keyboard('{ArrowRight}{Enter}')
  expect(onChange).toHaveBeenLastCalledWith('2028-02-29')
  expect(screen.getByLabelText('Stored date')).toHaveTextContent('2028-02-29')
  await waitFor(() => expect(trigger).toHaveFocus())
})

it('uses the application locale for dates, month names and navigation labels', async () => {
  const user = userEvent.setup()
  render(<Picker />)
  await user.click(screen.getByRole('button', { name: 'Due date' }))
  await screen.findByRole('grid')
  await act(async () => {
    await i18n.changeLanguage('pt-PT')
  })
  expect(
    screen.getByRole('button', { name: 'Ir para o próximo mês' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('grid')).toHaveAccessibleName(/fevereiro/i)
  expect(
    screen.getAllByRole('columnheader', { hidden: true })[0],
  ).toHaveTextContent('seg')
  expect(screen.getByRole('button', { name: 'Due date' })).toHaveTextContent(
    '28/02/2028',
  )
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Stored date')).toHaveTextContent('2028-02-28')
})

it('keeps manual input stable while typing and supports clearing an optional date', async () => {
  const user = userEvent.setup()
  render(<Picker initial="" />)
  await user.click(screen.getByRole('button', { name: 'Due date' }))
  expect(
    screen.queryByRole('textbox', { name: 'Date (YYYY-MM-DD)' }),
  ).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Type date' }))
  const input = await screen.findByRole('textbox', {
    name: 'Date (YYYY-MM-DD)',
  })
  await user.type(input, '0001-01-01')
  expect(input).toHaveValue('0001-01-01')
  expect(screen.getByLabelText('Stored date')).toHaveTextContent('0001-01-01')
  await user.keyboard('{Enter}')
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Due date' })).toHaveFocus(),
  )
  await user.click(screen.getByRole('button', { name: 'Due date' }))
  await user.click(screen.getByRole('button', { name: 'Clear date' }))
  expect(screen.getByLabelText('Stored date')).toBeEmptyDOMElement()
  expect(screen.getByRole('button', { name: 'Due date' })).toHaveTextContent(
    'Choose a date',
  )
})

it('exposes invalid manual dates when reopened without accepting them on Enter', async () => {
  const user = userEvent.setup()
  render(<Picker initial="2026-02-30" />)
  const trigger = screen.getByRole('button', { name: 'Due date' })
  await user.click(trigger)
  const input = screen.getByRole('textbox', { name: 'Date (YYYY-MM-DD)' })
  expect(input).toHaveAttribute('aria-invalid', 'true')
  await user.click(input)
  await user.keyboard('{Enter}')
  expect(input).toBeInTheDocument()
  await user.clear(input)
  await user.type(input, '2028-02-29')
  expect(input).toHaveAttribute('aria-invalid', 'false')
  await user.keyboard('{Enter}')
  await waitFor(() => expect(trigger).toHaveFocus())
  expect(screen.getByLabelText('Stored date')).toHaveTextContent('2028-02-29')
})
