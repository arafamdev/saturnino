import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import OrbitalIllustration from './OrbitalIllustration'

function HeroSection() {
  const { t } = useTranslation(['landing', 'common'])

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto grid w-full max-w-7xl items-center gap-8 px-6 pt-12 pb-6 sm:gap-10 sm:pt-16 sm:pb-10 lg:grid-cols-2 lg:px-8 lg:pt-24 lg:pb-12"
    >
      {/* Hero content */}
      <div className="flex flex-col items-center gap-5 text-center sm:gap-6 lg:items-start lg:text-left">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t('hero.eyebrow')}
        </p>

        <h1
          id="hero-heading"
          className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          <Trans
            t={t}
            i18nKey="hero.title"
            components={{
              highlight: <span className="text-primary" />,
            }}
          />
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('hero.description')}
        </p>

        <Button asChild size="lg" className="h-12 gap-2 px-6 text-base">
          <Link to="/app">
            {t('common:navigation.openApp')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>

        <p className="text-sm text-muted-foreground">
          {t('common:brand.tagline')}
        </p>
      </div>

      {/* Hero illustration */}
      <OrbitalIllustration />
    </section>
  )
}

export default HeroSection
