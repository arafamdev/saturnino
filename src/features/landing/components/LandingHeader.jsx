import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Logo from '@/components/shared/Logo'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'

function LandingHeader() {
  const { t } = useTranslation('common')

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:flex-nowrap sm:gap-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Header actions */}
        <nav
          aria-label={t('navigation.public')}
          className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3"
        >
          <Link
            to="/guide"
            className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('navigation.guide')}
          </Link>
          <Link
            to="/about"
            className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('navigation.about')}
          </Link>

          <LanguageSwitcher />

          <ThemeToggle />

          <Button asChild className="hidden sm:inline-flex">
            <Link to="/app">
              {t('navigation.openApp')}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

export default LandingHeader
