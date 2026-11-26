import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { workspaceRepository } from '@/lib/db/workspaceRepository'

export function useDashboardData() {
  const [retryCount, setRetryCount] = useState(0)
  const result = useLiveQuery(async () => {
    try {
      return {
        snapshot: await workspaceRepository.getSnapshot(),
        error: null,
        retryCount,
      }
    } catch (error) {
      return { snapshot: null, error, retryCount }
    }
  }, [retryCount])
  const current = result?.retryCount === retryCount ? result : undefined
  return {
    snapshot: current?.snapshot ?? null,
    isLoading: current === undefined,
    isError: Boolean(current?.error),
    retry: () => setRetryCount((count) => count + 1),
  }
}
