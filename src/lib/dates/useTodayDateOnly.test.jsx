import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useTodayDateOnly } from './useTodayDateOnly'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('updates the civil day after local midnight and schedules the next refresh', () => {
  vi.setSystemTime(new Date(2026, 10, 26, 23, 59, 59))
  const { result, unmount } = renderHook(useTodayDateOnly)
  expect(result.current).toBe('2026-11-26')
  act(() => vi.advanceTimersByTime(1200))
  expect(result.current).toBe('2026-11-27')
  expect(vi.getTimerCount()).toBe(1)
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('refreshes after a suspended tab regains focus and cleans up listeners', () => {
  vi.setSystemTime(new Date(2026, 10, 26, 12))
  const { result, unmount } = renderHook(useTodayDateOnly)
  vi.setSystemTime(new Date(2026, 10, 28, 12))
  act(() => window.dispatchEvent(new Event('focus')))
  expect(result.current).toBe('2026-11-28')
  unmount()
  act(() => window.dispatchEvent(new Event('focus')))
  expect(vi.getTimerCount()).toBe(0)
})
