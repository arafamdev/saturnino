import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { projectRepository } from '@/features/projects/services/projectRepository'

import { useSidebarProjects } from '../hooks/useSidebarProjects'

import { useSidebar } from '../hooks/useSidebar'
import { sidebarSectionIds } from '../state/sidebarReducer'

import SidebarProjectList from './SidebarProjectList'
import SidebarSection from './SidebarSection'

function SidebarRecentProjects({ onNavigate }) {
  const { t } = useTranslation('app')

  const { recentProjectIds, pruneRecentProjects } = useSidebar()

  const { projects, isLoading, isError, retry } = useSidebarProjects()

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  const recentProjects = recentProjectIds
    .map((projectId) => projectsById.get(projectId))
    .filter(Boolean)

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

  return (
    <SidebarSection
      sectionId={sidebarSectionIds.RECENT_PROJECTS}
      title={t('recentProjects.title')}
    >
      <SidebarProjectList
        projects={recentProjects}
        label={t('recentProjects.title')}
        emptyMessage={t('recentProjects.empty')}
        loadingMessage={t('recentProjects.loading')}
        errorMessage={t('recentProjects.loadError')}
        isLoading={isLoading}
        isError={isError}
        retry={retry}
        onNavigate={onNavigate}
      />
    </SidebarSection>
  )
}

export default SidebarRecentProjects
