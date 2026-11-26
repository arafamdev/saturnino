import { useEffect, useState } from 'react'

export const PROJECT_TASK_VIEW_KEY = 'saturnino:project-task-view'

export function useProjectTaskView(projectId) {
  const [view, setView] = useState(() => {
    if (!projectId) return 'list'
    try {
      const stored = localStorage.getItem(PROJECT_TASK_VIEW_KEY)
      return stored === 'list' ? 'list' : 'board'
    } catch {
      return 'board'
    }
  })

  useEffect(() => {
    if (!projectId) return
    try {
      localStorage.setItem(PROJECT_TASK_VIEW_KEY, view)
    } catch {
      // The current view remains usable when browser storage is unavailable.
    }
  }, [projectId, view])

  return [view, setView]
}
