import { useLiveQuery } from 'dexie-react-hooks'

import { projectRepository } from '../services/projectRepository'

export function useProject(projectId) {
  const project = useLiveQuery(async () => {
    if (!projectId) {
      return null
    }

    const existingProject = await projectRepository.getProjectById(projectId)

    return existingProject ?? null
  }, [projectId])

  const isLoading = project === undefined
  const isNotFound = project === null

  return {
    project: project ?? null,
    isLoading,
    isNotFound,
  }
}
