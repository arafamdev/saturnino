import { useTranslation } from 'react-i18next'

import GuideInlineText from './GuideInlineText'

const images = import.meta.glob('../assets/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const dimensions = {
  'project-form': [700, 700],
  'task-form': [700, 800],
  'task-details': [640, 800],
  sidebar: [700, 680],
  restore: [700, 660],
  dashboard: [1265, 791],
}

function GuideFigure({ name }) {
  const { t } = useTranslation('guide')
  const src = images[`../assets/guide-${name}.webp`]
  if (!src) return null
  return (
    <figure className="my-8 min-w-0">
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-xl border bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`${t(`figures.${name}.alt`)} — ${t('imageHint')}`}
      >
        <img
          src={src}
          alt={t(`figures.${name}.alt`)}
          loading="lazy"
          decoding="async"
          width={(dimensions[name] ?? [1280, 800])[0]}
          height={(dimensions[name] ?? [1280, 800])[1]}
          className="h-auto w-full"
        />
      </a>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <GuideInlineText>{t(`figures.${name}.caption`)}</GuideInlineText>{' '}
        <span className="mt-1 block text-xs">{t('figureNote')}</span>
        <span className="mt-1 block text-xs">{t('imageHint')}</span>
      </figcaption>
    </figure>
  )
}
export default GuideFigure
