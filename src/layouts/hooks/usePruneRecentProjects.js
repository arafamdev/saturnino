import { useEffect } from 'react'

import { projectRepository } from '@/features/projects/services/projectRepository'

// History integrity must not depend on section visibility or desktop compact mode.
export function usePruneRecentProjects(
  { projects, isLoading, isError },
  recentProjectIds,
  pruneRecentProjects,
) {
  useEffect(() => {
    if (isLoading || isError) {
      return
    }

    let cancelled = false
    const missingIds = recentProjectIds.filter(
      (id) => !projects.some((project) => project.id === id),
    )
    if (missingIds.length === 0) return
    Promise.all(
      missingIds.map(async (id) => [
        id,
        await projectRepository.getProjectById(id),
      ]),
    )
      .then((results) => {
        if (cancelled) return
        const deletedIds = new Set(
          results.filter(([, project]) => !project).map(([id]) => id),
        )
        pruneRecentProjects(
          recentProjectIds.filter((id) => !deletedIds.has(id)),
          recentProjectIds,
        )
      })
      .catch(() => {
        /* Preserve history when verification fails. */
      })
    return () => {
      cancelled = true
    }
  }, [projects, isLoading, isError, recentProjectIds, pruneRecentProjects])
}
