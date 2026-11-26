import { useTranslation } from 'react-i18next'

import portraitImage from '@/assets/images/legacy/manuel-saturnino-portrait.webp'

function LegacyProfileSection() {
  const { t } = useTranslation('about')

  return (
    <section
      aria-labelledby="legacy-profile-heading"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="grid items-center gap-10 md:grid-cols-[2fr_3fr] lg:gap-16">
        {/* Original family portrait */}
        <figure className="mx-auto w-full max-w-sm">
          <img
            src={portraitImage}
            alt={t('images.portraitAlt')}
            width={1170}
            height={1538}
            className="h-auto w-full rounded-2xl border shadow-lg"
          />

          <figcaption className="mt-3 text-center text-xs text-muted-foreground">
            {t('images.caption')}
          </figcaption>
        </figure>

        {/* Personal tribute */}
        <div className="space-y-6">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            {t('profile.eyebrow')}
          </p>

          <h2
            id="legacy-profile-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Manuel Saturnino da Costa
          </h2>

          <p className="text-lg font-medium text-primary">
            {t('profile.subtitle')}
          </p>

          <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>{t('profile.description')}</p>

            <p>{t('profile.tribute')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LegacyProfileSection
