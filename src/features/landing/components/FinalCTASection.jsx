import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import LegacyIllustration from './illustrations/LegacyIllustration'

function FinalCTASection() {
  const { t } = useTranslation(['landing', 'common'])

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card px-6 py-12 sm:px-12 sm:py-16 lg:py-20">
        {/* Decorative background glow */}
        <div
          className="pointer-events-none absolute inset-0 bg-radial from-primary/10 to-transparent"
          aria-hidden="true"
        />

        {/* Call to action */}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <div className="w-full max-w-56">
            <LegacyIllustration />
          </div>

          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            {t('finalCta.eyebrow')}
          </p>

          <h2
            id="final-cta-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            <Trans
              t={t}
              i18nKey="finalCta.title"
              components={{
                highlight: <span className="text-primary" />,
              }}
            />
          </h2>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('finalCta.description')}
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
      </div>
    </section>
  )
}

export default FinalCTASection
