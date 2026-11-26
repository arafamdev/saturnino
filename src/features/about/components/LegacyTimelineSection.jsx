import historyImage from '@/assets/images/legacy/manuel-saturnino-history.webp'

import HistoricalSources from './HistoricalSources'

import { legacyTimeline } from '../data/legacyTimeline'

function LegacyTimelineSection() {
  return (
    <section
      aria-labelledby="legacy-timeline-heading"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="grid items-center gap-10 md:grid-cols-[3fr_2fr] lg:gap-16">
        {/* Historical milestones */}
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              A legacy to remember
            </p>

            <h2
              id="legacy-timeline-heading"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              A life of purpose.
            </h2>
          </div>

          <ol aria-label="Historical milestones" className="space-y-8">
            {legacyTimeline.map(({ id, title, description }, index) => (
              <li key={id} className="group relative flex gap-5">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div
                  className="absolute top-12 -bottom-6 left-5 w-px -translate-x-1/2 bg-border group-last:hidden"
                  aria-hidden="true"
                />

                <div className="space-y-1 pt-1">
                  <h3 className="text-lg font-medium tracking-tight">
                    {title}
                  </h3>

                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <HistoricalSources />
        </div>

        {/* Original family portrait */}
        <figure className="mx-auto w-full max-w-sm">
          <img
            src={historyImage}
            alt="Another portrait of Manuel Saturnino da Costa"
            width={1170}
            height={1571}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-2xl border shadow-lg"
          />

          <figcaption className="mt-3 text-center text-xs text-muted-foreground">
            From the family archive.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

export default LegacyTimelineSection
