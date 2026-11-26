function AboutHeroSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Behind the name
        </p>

        <h1
          id="about-heading"
          className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Every name has a story.
          <br />
          <span className="text-primary">This one has a legacy.</span>
        </h1>

        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Inspired by a legacy. Built with purpose.
        </p>
      </div>
    </section>
  )
}

export default AboutHeroSection
