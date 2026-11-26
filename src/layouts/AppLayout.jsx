import { Link, NavLink, Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'

import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import ThemeToggle from '@/components/shared/ThemeToggle'

import { cn } from '@/lib/utils'

const navigationItems = [
  {
    labelKey: 'navigation.overview',
    to: '/app',
    end: true,
  },
  {
    labelKey: 'navigation.tasks',
    to: '/app/tasks',
  },
  {
    labelKey: 'navigation.projects',
    to: '/app/projects',
  },
  {
    labelKey: 'navigation.settings',
    to: '/app/settings',
  },
]

function AppLayout() {
  const { t } = useTranslation(['app', 'common'])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Application header */}
      <header className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-6">
        <Link
          to="/"
          aria-label={t('common:brand.home')}
          className="text-xl font-semibold tracking-tight"
        >
          saturnino.
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Application navigation */}
      <nav
        aria-label={t('navigation.label')}
        className="flex flex-wrap gap-2 border-b px-4 py-3 sm:px-6"
      >
        {navigationItems.map(({ labelKey, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* Active page */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
