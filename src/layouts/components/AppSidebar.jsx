import { useTranslation } from 'react-i18next'

import Logo from '@/components/shared/Logo'

import { sidebarSectionIds } from '../state/sidebarReducer'

import AppNavigation from './AppNavigation'
import SidebarSection from './SidebarSection'
import WorkspaceIndicator from './WorkspaceIndicator'

function AppSidebar() {
  const { t } = useTranslation('app')

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-muted/30 lg:flex">
      {/* Brand */}
      <div className="px-5 py-5">
        <Logo />
      </div>

      {/* Workspace navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarSection
          sectionId={sidebarSectionIds.WORKSPACE}
          title={t('workspace.title')}
        >
          <AppNavigation />
        </SidebarSection>
      </div>

      {/* Workspace information */}
      <div className="border-t p-3">
        <WorkspaceIndicator />
      </div>
    </aside>
  )
}

export default AppSidebar
