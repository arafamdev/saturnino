import { useTranslation } from 'react-i18next'

import { philosophyPillars } from '../data/philosophyData'

function PhilosophySection() {
  const { t } = useTranslation('landing')

  return (
    <section
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="mx-auto w-full max-w-7xl scroll-mt-24 space-y-8 px-4 py-12 sm:space-y-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      {/* Section introduction */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t('philosophy.eyebrow')}
        </p>

        <h2
          id="philosophy-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          {t('philosophy.title')}
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('philosophy.description')}
        </p>
      </div>

      {/* Philosophy pillars */}
      <div className="grid gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-12">
        {philosophyPillars.map(({ id, illustration: Illustration }) => (
          <article
            key={id}
            className="flex flex-col items-center gap-4 text-center"
          >
            <Illustration />

            <div className="max-w-xs space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t(`philosophy.items.${id}.title`)}
              </h3>

              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t(`philosophy.items.${id}.description`)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PhilosophySection
