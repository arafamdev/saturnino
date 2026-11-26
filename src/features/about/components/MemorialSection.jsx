import LegacyIllustration from '@/features/landing/components/illustrations/LegacyIllustration'

function MemorialSection() {
  return (
    <section
      aria-labelledby="memorial-heading"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card px-6 py-12 sm:px-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-radial from-primary/10 to-transparent"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
          <div className="w-full max-w-56">
            <LegacyIllustration />
          </div>

          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            In loving memory
          </p>

          <h2
            id="memorial-heading"
            className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Some legacies live forever.
          </h2>

          <p className="text-lg text-muted-foreground">
            Manuel Saturnino da Costa
          </p>

          <p className="text-sm text-muted-foreground italic">
            Built with purpose. Inspired by legacy.
          </p>
        </div>
      </div>
    </section>
  )
}

export default MemorialSection
