import { Outlet } from 'react-router'

import AppHeader from './components/AppHeader'
import AppSidebar from './components/AppSidebar'
import SidebarProvider from './context/SidebarProvider'

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh bg-background text-foreground">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />

          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout
