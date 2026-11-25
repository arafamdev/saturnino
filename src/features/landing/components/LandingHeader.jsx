import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

import Logo from '@/components/shared/Logo'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Header actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/about"
            className="rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>

          <ThemeToggle />

          <Button asChild className="hidden sm:inline-flex">
            <Link to="/app">
              Open Saturnino
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
