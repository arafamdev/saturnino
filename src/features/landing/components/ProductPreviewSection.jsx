import BoardPreview from './preview/BoardPreview'

function ProductPreviewSection() {
  return (
    <section
      id="product-preview"
      aria-labelledby="product-preview-heading"
      className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-6 pb-12 sm:space-y-10 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-12 lg:pb-20"
    >
      {/* Section introduction */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          Your work, in sync
        </p>

        <h2
          id="product-preview-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          A little more clarity.
          <br />A lot more focus.
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          Visualize your progress, organize your priorities, and move from ideas
          to achievements.
        </p>
      </div>

      <BoardPreview />

      <p className="text-center text-xs text-muted-foreground">
        Illustrative product preview
      </p>
    </section>
  )
}

export default ProductPreviewSection
