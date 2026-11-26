import Logo from '@/components/shared/Logo'

import SidebarCustomization from './SidebarCustomization'
import SidebarProjectSections from './SidebarProjectSections'
import WorkspaceIndicator from './WorkspaceIndicator'

function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-muted/30 lg:flex">
      {/* Brand */}
      <div className="px-5 py-5">
        <Logo />
      </div>

      {/* Navigation sections */}
      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        <SidebarProjectSections />
        <SidebarCustomization />
      </div>

      {/* Workspace information */}
      <div className="border-t p-3">
        <WorkspaceIndicator />
      </div>
    </aside>
  )
}

export default AppSidebar
