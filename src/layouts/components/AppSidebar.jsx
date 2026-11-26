import { useTranslation } from 'react-i18next'

import Logo from '@/components/shared/Logo'

import AppNavigation from './AppNavigation'
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
        <p className="mb-3 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t('workspace.title')}
        </p>

        <AppNavigation />
      </div>

      {/* Workspace information */}
      <div className="border-t p-3">
        <WorkspaceIndicator />
      </div>
    </aside>
  )
}

export default AppSidebar
