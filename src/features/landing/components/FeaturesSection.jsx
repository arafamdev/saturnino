import { features } from '../data/featuresData'

import FeatureCard from './FeatureCard'

function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:space-y-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      {/* Section introduction */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Built for focus
        </p>

        <h2
          id="features-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          Everything you need.
          <br />
          Nothing you don't.
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          A thoughtful set of tools to keep your projects, tasks, and priorities
          in orbit.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
