import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import LegacyIllustration from './illustrations/LegacyIllustration'

function OurStorySection() {
  const { t } = useTranslation(['landing', 'common'])

  return (
    <section
      id="our-story"
      aria-labelledby="our-story-heading"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-10 text-center sm:px-12 sm:py-14 lg:py-16">
        {/* Subtle orbital glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-lg bg-primary/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <LegacyIllustration />

          {/* Personal tribute */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              {t('ourStory.eyebrow')}
            </p>

            <h2
              id="our-story-heading"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              <Trans
                t={t}
                i18nKey="ourStory.title"
                components={{
                  break: <br />,
                  highlight: <span className="text-primary" />,
                }}
              />
            </h2>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('ourStory.description')}
            </p>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('ourStory.tribute')}
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            className="gap-2 text-primary hover:text-primary"
          >
            <Link to="/about">
              {t('ourStory.discover')}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>

          {/* Project signature */}
          <div className="w-full border-t pt-6">
            <p className="text-sm text-muted-foreground italic">
              {t('common:brand.signature')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurStorySection
