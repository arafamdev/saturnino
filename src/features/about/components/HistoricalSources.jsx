import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { historicalSources } from '../data/historicalSources'

function HistoricalSources() {
  const { t } = useTranslation(['about', 'common'])

  return (
    <details className="group rounded-xl border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-4 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
        {t('sources.title')}

        <ChevronDown
          className="size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>

      <div className="space-y-4 border-t p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('sources.description')}
        </p>

        <ul className="space-y-4">
          {historicalSources.map(({ id, name, href }) => (
            <li key={id}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{name}</p>

                  <p className="text-xs text-muted-foreground">
                    {t(`sources.items.${id}`)}
                  </p>
                </div>

                <ArrowUpRight
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />

                <span className="sr-only">
                  {' '}
                  ({t('common:accessibility.opensInNewTab')})
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}

export default HistoricalSources
