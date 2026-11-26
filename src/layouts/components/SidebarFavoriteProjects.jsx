import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { useProjects } from '@/features/projects/hooks/useProjects'
import { cn } from '@/lib/utils'

import { sidebarSectionIds } from '../state/sidebarReducer'

import SidebarSection from './SidebarSection'

function SidebarFavoriteProjects({ onNavigate }) {
  const { t } = useTranslation('app')
  const { projects, isLoading, isError, retry } = useProjects()

  const favoriteProjects = (projects ?? []).filter(
    (project) => project.isFavorite === true,
  )

  function renderFavoriteProjects() {
    if (isError) {
      return (
        <div className="space-y-2 px-3 py-2">
          <p role="alert" className="text-xs text-muted-foreground">
            {t('favorites.loadError')}
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
        <p role="status" className="px-3 py-2 text-xs text-muted-foreground">
          {t('favorites.loading')}
        </p>
      )
    }

    if (favoriteProjects.length === 0) {
      return (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          {t('favorites.empty')}
        </p>
      )
    }

    return (
      <nav aria-label={t('favorites.title')} className="flex flex-col gap-1">
        {favoriteProjects.map((project) => (
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
      sectionId={sidebarSectionIds.FAVORITES}
      title={t('favorites.title')}
    >
      {renderFavoriteProjects()}
    </SidebarSection>
  )
}

export default SidebarFavoriteProjects
