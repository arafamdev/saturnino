import { useTranslation } from 'react-i18next'

import { useSidebar } from '../hooks/useSidebar'
import { sidebarSectionIds } from '../state/sidebarReducer'

import AppNavigation from './AppNavigation'
import SidebarFavoriteProjects from './SidebarFavoriteProjects'
import SidebarProjectExplorer from './SidebarProjectExplorer'
import SidebarRecentProjects from './SidebarRecentProjects'
import SidebarSection from './SidebarSection'

function SidebarProjectSections({ onNavigate }) {
  const { t } = useTranslation('app')
  const { sectionOrder, hiddenSections } = useSidebar()
  const sections = {
    workspace: (
      <SidebarSection
        sectionId={sidebarSectionIds.WORKSPACE}
        title={t('workspace.title')}
      >
        <AppNavigation onNavigate={onNavigate} />
      </SidebarSection>
    ),
    favorites: <SidebarFavoriteProjects onNavigate={onNavigate} />,
    recentProjects: <SidebarRecentProjects onNavigate={onNavigate} />,
    projectExplorer: <SidebarProjectExplorer onNavigate={onNavigate} />,
  }

  return sectionOrder
    .filter((id) => !hiddenSections.includes(id))
    .map((id) => <div key={id}>{sections[id]}</div>)
}

export default SidebarProjectSections
