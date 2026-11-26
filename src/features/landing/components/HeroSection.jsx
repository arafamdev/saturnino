import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import OrbitalIllustration from './OrbitalIllustration'

function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto grid w-full max-w-7xl items-center gap-8 px-6 pt-12 pb-6 sm:gap-10 sm:pt-16 sm:pb-10 lg:grid-cols-2 lg:px-8 lg:pt-24 lg:pb-12"
    >
      {/* Hero content */}
      <div className="flex flex-col items-center gap-5 text-center sm:gap-6 lg:items-start lg:text-left">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Organize. Focus. Evolve.
        </p>

        <h1
          id="hero-heading"
          className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          Bring your work into <span className="text-primary">orbit.</span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          Organize your projects, manage your tasks, and focus on what truly
          matters.
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

      {/* Hero illustration */}
      <OrbitalIllustration />
    </section>
  )
}

export default HeroSection
