import WorkflowStep from './WorkflowStep'

import { workflowSteps } from '../data/workflowSteps'

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mx-auto w-full max-w-7xl space-y-10 px-4 py-12 sm:space-y-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      {/* Section introduction */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          How it works
        </p>

        <h2
          id="how-it-works-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          From idea to done.
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Three simple steps. One clear direction.
        </p>
      </div>

      <div className="relative">
        {/* Decorative orbital connection */}
        <svg
          viewBox="0 0 900 128"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-32 w-full text-primary sm:block"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M150 64 Q300 0 450 64 T750 64"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 7"
            vectorEffect="non-scaling-stroke"
            opacity="0.4"
          />
        </svg>

        {/* Sequential workflow */}
        <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-12">
          {workflowSteps.map((step, index) => (
            <WorkflowStep key={step.id} step={step} stepNumber={index + 1} />
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorksSection
