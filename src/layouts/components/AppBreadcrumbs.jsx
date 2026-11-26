import { ChevronRight } from 'lucide-react'
import { Link, matchPath, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'

import { navigationItems } from '../data/navigationItems'

function AppBreadcrumbs() {
  const { t } = useTranslation('app')
  const { pathname } = useLocation()

  const currentNavigationItem = navigationItems.find(({ to }) =>
    matchPath({ path: to, end: true }, pathname),
  )

  const isProjectDetails = Boolean(
    matchPath('/app/projects/:projectId', pathname),
  )

  const currentPageLabel = isProjectDetails
    ? t('projectDetails.title')
    : t(currentNavigationItem?.labelKey ?? 'navigation.overview')

  return (
    <nav aria-label={t('breadcrumbs.label')} className="min-w-0">
      <ol className="flex items-center gap-2 text-sm">
        <li className="hidden shrink-0 sm:block">
          <Link
            to="/app"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('workspace.title')}
          </Link>
        </li>

        <li className="hidden sm:block" aria-hidden="true">
          <ChevronRight className="size-4 text-muted-foreground" />
        </li>

        {isProjectDetails && (
          <>
            <li className="hidden shrink-0 md:block">
              <Link
                to="/app/projects"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('navigation.projects')}
              </Link>
            </li>

            <li className="hidden md:block" aria-hidden="true">
              <ChevronRight className="size-4 text-muted-foreground" />
            </li>
          </>
        )}

        <li aria-current="page" className="min-w-0 truncate font-medium">
          {currentPageLabel}
        </li>
      </ol>
    </nav>
  )
}

export default AppBreadcrumbs
