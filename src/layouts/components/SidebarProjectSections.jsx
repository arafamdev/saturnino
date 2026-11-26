import { useTranslation } from 'react-i18next'

import { sidebarSectionIds } from '../state/sidebarReducer'

import AppNavigation from './AppNavigation'
import SidebarFavoriteProjects from './SidebarFavoriteProjects'
import SidebarProjectExplorer from './SidebarProjectExplorer'
import SidebarRecentProjects from './SidebarRecentProjects'
import SidebarSection from './SidebarSection'

function SidebarProjectSections({ onNavigate }) {
  const { t } = useTranslation('app')
  return (
    <>
      <SidebarSection
        sectionId={sidebarSectionIds.WORKSPACE}
        title={t('workspace.title')}
      >
        <AppNavigation onNavigate={onNavigate} />
      </SidebarSection>
      <SidebarFavoriteProjects onNavigate={onNavigate} />
      <SidebarRecentProjects onNavigate={onNavigate} />
      <SidebarProjectExplorer onNavigate={onNavigate} />
    </>
  )
}
export default SidebarProjectSections
