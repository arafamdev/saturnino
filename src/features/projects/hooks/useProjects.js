import { useLiveQuery } from 'dexie-react-hooks'

import { projectRepository } from '../services/projectRepository'

export function useProjects() {
  const projects = useLiveQuery(() => projectRepository.getProjects(), [])

  const isLoading = projects === undefined

  return {
    projects: projects ?? [],
    isLoading,
  }
}
