import { useState } from 'react'

import { useLiveQuery } from 'dexie-react-hooks'

import { taskRepository } from '../services/taskRepository'

export function useTasks(projectId) {
  const [retryCount, setRetryCount] = useState(0)
  const result = useLiveQuery(async () => {
    try {
      return {
        tasks: await taskRepository.getTasks(projectId),
        error: null,
        projectId,
        retryCount,
      }
    } catch (error) {
      return { tasks: [], error, projectId, retryCount }
    }
  }, [projectId, retryCount])
  // A previous project's result must not flash while the route changes.
  const currentResult =
    result?.projectId === projectId && result?.retryCount === retryCount
      ? result
      : undefined
  const error = currentResult?.error ?? null
  return {
    tasks: currentResult?.tasks ?? [],
    isLoading: currentResult === undefined,
    isError: error !== null,
    error,
    retry: () => setRetryCount((count) => count + 1),
  }
}
