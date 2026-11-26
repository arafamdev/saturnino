import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { PROJECT_TASK_VIEW_KEY, useProjectTaskView } from './useProjectTaskView'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

it('defaults project workspaces to the board and remembers a list preference', () => {
  const first = renderHook(() => useProjectTaskView('project-one'))
  expect(first.result.current[0]).toBe('board')
  act(() => first.result.current[1]('list'))
  first.unmount()
  const second = renderHook(() => useProjectTaskView('project-two'))
  expect(second.result.current[0]).toBe('list')
})

it('keeps global tasks in a list without overwriting the project preference', () => {
  localStorage.setItem(PROJECT_TASK_VIEW_KEY, 'board')
  const { result } = renderHook(() => useProjectTaskView())
  expect(result.current[0]).toBe('list')
  expect(localStorage.getItem(PROJECT_TASK_VIEW_KEY)).toBe('board')
})

it('ignores obsolete preferences and remains usable when storage is blocked', () => {
  localStorage.setItem(PROJECT_TASK_VIEW_KEY, 'obsolete')
  const invalid = renderHook(() => useProjectTaskView('project'))
  expect(invalid.result.current[0]).toBe('board')
  invalid.unmount()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  const blocked = renderHook(() => useProjectTaskView('project'))
  expect(blocked.result.current[0]).toBe('board')
  act(() => blocked.result.current[1]('list'))
  expect(blocked.result.current[0]).toBe('list')
})
