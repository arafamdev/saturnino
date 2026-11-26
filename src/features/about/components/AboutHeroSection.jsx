import { Trans, useTranslation } from 'react-i18next'

function AboutHeroSection() {
  const { t } = useTranslation('about')

  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t('hero.eyebrow')}
        </p>

        <h1
          id="about-heading"
          className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl"
        >
          <Trans
            t={t}
            i18nKey="hero.title"
            components={{
              break: <br />,
              highlight: <span className="text-primary" />,
            }}
          />
        </h1>

        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('hero.description')}
        </p>
      </div>
    </section>
  )
}

export default AboutHeroSection
