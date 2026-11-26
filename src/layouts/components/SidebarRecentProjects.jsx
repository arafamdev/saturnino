import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { useProjects } from '@/features/projects/hooks/useProjects'
import { cn } from '@/lib/utils'

import { useSidebar } from '../hooks/useSidebar'
import { sidebarSectionIds } from '../state/sidebarReducer'

import SidebarSection from './SidebarSection'

function SidebarRecentProjects({ onNavigate }) {
  const { t } = useTranslation('app')

  const { recentProjectIds, pruneRecentProjects } = useSidebar()

  const { projects, isLoading, isError, retry } = useProjects()

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  const recentProjects = recentProjectIds
    .map((projectId) => projectsById.get(projectId))
    .filter(Boolean)

  useEffect(() => {
    if (isLoading || isError) {
      return
    }

    const existingProjectIds = projects.map((project) => project.id)

    pruneRecentProjects(existingProjectIds)
  }, [projects, isLoading, isError, pruneRecentProjects])

  function renderRecentProjects() {
    if (isError) {
      return (
        <div className="space-y-2 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {t('recentProjects.loadError')}
          </p>

          <button
            type="button"
            onClick={retry}
            className="rounded-sm text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {t('projects.actions.retry')}
          </button>
        </div>
      )
    }

    if (isLoading) {
      return (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          {t('recentProjects.loading')}
        </p>
      )
    }

    if (recentProjects.length === 0) {
      return (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          {t('recentProjects.empty')}
        </p>
      )
    }

    return (
      <nav
        aria-label={t('recentProjects.title')}
        className="flex flex-col gap-1"
      >
        {recentProjects.map((project) => (
          <NavLink
            key={project.id}
            to={`/app/projects/${project.id}`}
            onClick={onNavigate}
            title={project.name}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />

            <span className="min-w-0 truncate">{project.name}</span>
          </NavLink>
        ))}
      </nav>
    )
  }

  return (
    <SidebarSection
      sectionId={sidebarSectionIds.RECENT_PROJECTS}
      title={t('recentProjects.title')}
    >
      {renderRecentProjects()}
    </SidebarSection>
  )
}

export default SidebarRecentProjects
