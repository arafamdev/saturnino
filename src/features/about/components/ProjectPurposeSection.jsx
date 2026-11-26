import { Focus, Layers, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const projectPrinciples = [
  {
    id: 'organize',
    icon: Layers,
  },
  {
    id: 'focus',
    icon: Focus,
  },
  {
    id: 'evolve',
    icon: TrendingUp,
  },
]

function ProjectPurposeSection() {
  const { t } = useTranslation('about')

  return (
    <section
      aria-labelledby="project-purpose-heading"
      className="mx-auto w-full max-w-5xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t('purpose.eyebrow')}
        </p>

        <h2
          id="project-purpose-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {t('purpose.title')}
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('purpose.description')}
        </p>
      </div>

      <div className="grid gap-10 sm:grid-cols-3">
        {projectPrinciples.map(({ id, icon: PrincipleIcon }) => (
          <article
            key={id}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <PrincipleIcon
                className="size-7 text-primary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {t(`purpose.items.${id}.title`)}
              </h3>

              <p className="text-sm text-muted-foreground">
                {t(`purpose.items.${id}.description`)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProjectPurposeSection
