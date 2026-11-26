import { ArrowUpRight, ChevronDown } from 'lucide-react'

import { historicalSources } from '../data/historicalSources'

function HistoricalSources() {
  return (
    <details className="group rounded-xl border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl p-4 text-sm font-medium text-primary [&::-webkit-details-marker]:hidden">
        Discover his story
        <ChevronDown
          className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>

      <div className="space-y-4 border-t p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Explore historical accounts of his life and contribution to
          Guinea-Bissau.
        </p>

        <ul className="space-y-4">
          {historicalSources.map(({ id, name, description, href }) => (
            <li key={id}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{name}</p>

                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>

                <ArrowUpRight
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />

                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}

export default HistoricalSources
