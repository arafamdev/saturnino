import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import LegacyIllustration from './illustrations/LegacyIllustration'

function FinalCTASection() {
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
            Your next move
          </p>

          <h2
            id="final-cta-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Ready to bring your work into{' '}
            <span className="text-primary">orbit?</span>
          </h2>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start small. Stay focused. Make meaningful progress.
          </p>

          <Button asChild size="lg" className="h-12 gap-2 px-6 text-base">
            <Link to="/app">
              Open Saturnino
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            Everything in its orbit.
          </p>
        </div>
      </div>
    </section>
  )
}

export default FinalCTASection
