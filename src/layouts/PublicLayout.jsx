import { Link, Outlet } from 'react-router'

import ThemeToggle from '@/components/shared/ThemeToggle'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Public header */}
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          saturnino.
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            About
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
