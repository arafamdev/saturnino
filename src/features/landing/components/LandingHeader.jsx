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
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Header actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/about"
            className="rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
