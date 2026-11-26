import { useTranslation } from 'react-i18next'

import { useSidebarProjects } from '../hooks/useSidebarProjects'

import { sidebarSectionIds } from '../state/sidebarReducer'

import SidebarProjectList from './SidebarProjectList'
import SidebarSection from './SidebarSection'

function SidebarFavoriteProjects({ onNavigate }) {
  const { t } = useTranslation('app')

  const { projects, isLoading, isError, retry } = useSidebarProjects()

  const favoriteProjects = projects.filter(
    (project) => project.isFavorite === true,
  )

  return (
    <SidebarSection
      sectionId={sidebarSectionIds.FAVORITES}
      title={t('favorites.title')}
    >
      <SidebarProjectList
        projects={favoriteProjects}
        label={t('favorites.title')}
        emptyMessage={t('favorites.empty')}
        loadingMessage={t('favorites.loading')}
        errorMessage={t('favorites.loadError')}
        isLoading={isLoading}
        isError={isError}
        retry={retry}
        announceStatus
        onNavigate={onNavigate}
      />
    </SidebarSection>
  )
}

export default SidebarFavoriteProjects
