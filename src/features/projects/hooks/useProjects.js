import { useState } from 'react'

import { useLiveQuery } from 'dexie-react-hooks'

import { projectRepository } from '../services/projectRepository'

export function useProjects() {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    try {
      const projects = await projectRepository.getProjects()

      return {
        projects,
        error: null,
        retryCount,
      }
    } catch (error) {
      return {
        projects: [],
        error,
        retryCount,
      }
    }
  }, [retryCount])

  // Ignore results from previous query attempts.
  const currentResult = result?.retryCount === retryCount ? result : undefined

  const isLoading = currentResult === undefined
  const error = currentResult?.error ?? null

  function retry() {
    setRetryCount((currentCount) => currentCount + 1)
  }

  return {
    projects: currentResult?.projects ?? [],
    isLoading,
    isError: error !== null,
    error,
    retry,
  }
}
