import 'fake-indexeddb/auto'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { taskRepository } from '../services/taskRepository'

import { useTasks } from './useTasks'

afterEach(() => vi.restoreAllMocks())

describe('Reactive task query', () => {
  it('does not expose the previous project while a different scope loads', async () => {
    vi.spyOn(taskRepository, 'getTasks').mockImplementation(
      async (projectId) => [{ id: projectId, title: projectId }],
    )
    const { result, rerender } = renderHook(
      ({ projectId }) => useTasks(projectId),
      { initialProps: { projectId: 'first' } },
    )
    await waitFor(() => expect(result.current.tasks[0]?.id).toBe('first'))
    rerender({ projectId: 'second' })
    expect(result.current.tasks.some((task) => task.id === 'first')).toBe(false)
    await waitFor(() => expect(result.current.tasks[0]?.id).toBe('second'))
  })

  it('distinguishes read errors from an empty result and retries', async () => {
    vi.spyOn(taskRepository, 'getTasks')
      .mockRejectedValueOnce(new Error('READ_FAILED'))
      .mockResolvedValueOnce([])
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.isLoading).toBe(false)
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isError).toBe(false)
    expect(result.current.tasks).toEqual([])
  })
})
