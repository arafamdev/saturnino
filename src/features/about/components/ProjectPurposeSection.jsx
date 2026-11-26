import { Focus, Layers, TrendingUp } from 'lucide-react'

const projectPrinciples = [
  {
    id: 'organize',
    icon: Layers,
    title: 'Organize.',
    description: 'Bring clarity to your work.',
  },
  {
    id: 'focus',
    icon: Focus,
    title: 'Focus.',
    description: 'Make space for what matters.',
  },
  {
    id: 'evolve',
    icon: TrendingUp,
    title: 'Evolve.',
    description: 'Move forward with intention.',
  },
]

function ProjectPurposeSection() {
  return (
    <section
      aria-labelledby="project-purpose-heading"
      className="mx-auto w-full max-w-5xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Our purpose
        </p>

        <h2
          id="project-purpose-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Small steps. Meaningful progress.
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Saturnino exists to help people bring clarity to their work, focus on
          what matters, and move forward with intention.
        </p>
      </div>

      <div className="grid gap-10 sm:grid-cols-3">
        {projectPrinciples.map(
          ({ id, icon: PrincipleIcon, title, description }) => (
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
                <h3 className="text-xl font-semibold">{title}</h3>

                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  )
}

export default ProjectPurposeSection
