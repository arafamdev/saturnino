import { Trans, useTranslation } from 'react-i18next'

import BoardPreview from './preview/BoardPreview'

function ProductPreviewSection() {
  const { t } = useTranslation('landing')

  return (
    <section
      id="product-preview"
      aria-labelledby="product-preview-heading"
      className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-6 pb-12 sm:space-y-10 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-12 lg:pb-20"
    >
      {/* Section introduction */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t('productPreview.eyebrow')}
        </p>

        <h2
          id="product-preview-heading"
          className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          <Trans
            t={t}
            i18nKey="productPreview.title"
            components={{ break: <br /> }}
          />
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t('productPreview.description')}
        </p>
      </div>

      <BoardPreview />

      <p className="text-center text-xs text-muted-foreground">
        {t('productPreview.caption')}
      </p>
    </section>
  )
}

export default ProductPreviewSection
