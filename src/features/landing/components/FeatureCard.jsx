import { useTranslation } from 'react-i18next'

function FeatureCard({ feature }) {
  const { t } = useTranslation('landing')

  const { id, icon: FeatureIcon } = feature

  return (
    <article className="group flex h-full flex-col gap-5 rounded-2xl border bg-card p-6 transition-colors duration-200 hover:border-primary/40 sm:p-7">
      {/* Feature icon */}
      <div className="flex size-12 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
        <FeatureIcon className="size-6" aria-hidden="true" />
      </div>

      {/* Feature content */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight">
          {t(`features.items.${id}.title`)}
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {t(`features.items.${id}.description`)}
        </p>
      </div>
    </article>
  )
}

export default FeatureCard
