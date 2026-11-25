import { Link, NavLink, Outlet } from 'react-router'

import ThemeToggle from '@/components/shared/ThemeToggle'

import { cn } from '@/lib/utils'

const navigationItems = [
  { label: 'Overview', to: '/app', end: true },
  { label: 'My Tasks', to: '/app/tasks' },
  { label: 'Projects', to: '/app/projects' },
  { label: 'Settings', to: '/app/settings' },
]

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Application header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          saturnino.
        </Link>

        <ThemeToggle />
      </header>

      {/* Application navigation */}
      <nav
        aria-label="Main navigation"
        className="flex flex-wrap gap-2 border-b px-6 py-3"
      >
        {navigationItems.map(({ label, to, end }) => (
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
            {label}
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
