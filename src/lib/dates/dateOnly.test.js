import { describe, expect, it } from 'vitest'

import { formatDateOnly, getTodayDateOnly, isValidDateOnly } from './dateOnly'

describe('Calendar dates', () => {
  it.each(['2026-11-26', '2028-02-29', '2000-02-29', '0001-01-01'])(
    'accepts a real day: %s',
    (value) => expect(isValidDateOnly(value)).toBe(true),
  )
  it.each([
    '2026-02-29',
    '1900-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-10',
    '2026-01-00',
    '0000-01-01',
    '2026-1-1',
    '2026-01-01T00:00:00Z',
    '',
    null,
    123,
  ])('rejects an invalid day: %s', (value) =>
    expect(isValidDateOnly(value)).toBe(false),
  )
  it('uses the local calendar day and displays the stored date without UTC conversion', () => {
    expect(getTodayDateOnly(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02')
    expect(formatDateOnly('2026-11-26', 'en')).toContain('26')
    expect(formatDateOnly('bad', 'en')).toBe('')
  })
})
