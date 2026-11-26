import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import ThemeToggle from '@/components/shared/ThemeToggle'

import AppBreadcrumbs from './AppBreadcrumbs'
import MobileNavigation from './MobileNavigation'

function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b bg-background px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation />
        <AppBreadcrumbs />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  )
}

export default AppHeader
