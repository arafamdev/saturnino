import { useTranslation } from 'react-i18next'

import { useSidebar } from '../hooks/useSidebar'
import { useSidebarProjects } from '../hooks/useSidebarProjects'
import { sidebarSectionIds } from '../state/sidebarReducer'

import SidebarProjectList from './SidebarProjectList'
import SidebarSection from './SidebarSection'

function SidebarRecentProjects({ onNavigate }) {
  const { t } = useTranslation('app')

  const { recentProjectIds } = useSidebar()

  const { projects, isLoading, isError, retry } = useSidebarProjects()

  const projectsById = new Map(projects.map((project) => [project.id, project]))

  const recentProjects = recentProjectIds
    .map((projectId) => projectsById.get(projectId))
    .filter(Boolean)

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
