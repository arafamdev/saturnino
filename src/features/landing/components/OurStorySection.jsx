import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import LegacyIllustration from './illustrations/LegacyIllustration'

function OurStorySection() {
  return (
    <section
      id="our-story"
      aria-labelledby="our-story-heading"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-10 text-center sm:px-12 sm:py-14 lg:py-16">
        {/* Subtle orbital glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-lg bg-primary/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <LegacyIllustration />

          {/* Personal tribute */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              The story behind Saturnino
            </p>

            <h2
              id="our-story-heading"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              More than a name.
              <br />
              <span className="text-primary">A legacy.</span>
            </h2>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Saturnino is named in honour of my late father, Manuel Saturnino
              da Costa, a freedom fighter and former Prime Minister of
              Guinea-Bissau.
            </p>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              More than a software project, it is a personal tribute to his
              memory and enduring legacy.
            </p>
          </div>

          <Button
            asChild
            variant="ghost"
            className="gap-2 text-primary hover:text-primary"
          >
            <Link to="/about">
              Discover the story
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>

          {/* Project signature */}
          <div className="w-full border-t pt-6">
            <p className="text-sm text-muted-foreground italic">
              Built with purpose. Inspired by legacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurStorySection
