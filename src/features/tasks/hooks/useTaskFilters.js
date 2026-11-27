import { useSearchParams } from 'react-router'

import {
  readTaskFilterParams,
  writeTaskFilterParams,
} from '../utils/taskFilterParams'

export function useTaskFilters(projectId) {
  const [params, setParams] = useSearchParams()
  const filters = readTaskFilterParams(params, projectId)

  function setFilters(update) {
    setParams(
      (current) => {
        const previous = readTaskFilterParams(current, projectId)
        const next = typeof update === 'function' ? update(previous) : update
        return writeTaskFilterParams(current, next, projectId)
      },
      { replace: true, preventScrollReset: true },
    )
  }

  return [filters, setFilters]
}
