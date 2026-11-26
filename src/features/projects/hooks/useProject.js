import { useState } from 'react'

import { useLiveQuery } from 'dexie-react-hooks'

import { projectRepository } from '../services/projectRepository'

export function useProject(projectId) {
  const [retryCount, setRetryCount] = useState(0)

  const result = useLiveQuery(async () => {
    try {
      const project = projectId
        ? await projectRepository.getProjectById(projectId)
        : null

      return {
        project: project ?? null,
        projectId,
        retryCount,
        error: null,
      }
    } catch (error) {
      return {
        project: null,
        projectId,
        retryCount,
        error,
      }
    }
  }, [projectId, retryCount])

  // Prevent stale project data during navigation or retry.
  const currentResult =
    result?.projectId === projectId && result?.retryCount === retryCount
      ? result
      : undefined

  const isLoading = currentResult === undefined
  const error = currentResult?.error ?? null
  const isError = error !== null
  const project = currentResult?.project ?? null

  const isNotFound = !isLoading && !isError && project === null

  function retry() {
    setRetryCount((currentCount) => currentCount + 1)
  }

  return {
    project,
    isLoading,
    isNotFound,
    isError,
    error,
    retry,
  }
}
