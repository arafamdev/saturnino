import { useTranslation } from 'react-i18next'

import { dateOnlyToLocalDate, formatDateOnly } from '@/lib/dates/dateOnly'

function DashboardTrend({ activity }) {
  const { t, i18n } = useTranslation('app')
  const numbers = new Intl.NumberFormat(i18n.resolvedLanguage)
  const shortDate = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'short',
  })
  const maximum =
    Math.ceil(
      Math.max(
        1,
        ...activity.days.flatMap((day) => [day.created, day.completed]),
      ) / 2,
    ) * 2
  const step = 560 / Math.max(activity.days.length, 1)
  const dateLabel = (day) => shortDate.format(dateOnlyToLocalDate(day.date))
  return (
    <section
      aria-labelledby="dashboard-trend-heading"
      className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="dashboard-trend-heading"
            className="text-base font-semibold tracking-tight"
          >
            {t('dashboard.activityTitle')}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('dashboard.activityPeriod')}
          </p>
        </div>
        <ul
          className="flex flex-wrap gap-4 text-xs text-muted-foreground"
          aria-label={t('dashboard.chartLegend')}
        >
          <li className="flex items-center gap-2">
            <span className="size-2 rounded-sm bg-primary" aria-hidden="true" />
            {t('dashboard.created')}
          </li>
          <li className="flex items-center gap-2">
            <span
              className="size-2 rounded-sm bg-status-done"
              aria-hidden="true"
            />
            {t('dashboard.completed')}
          </li>
        </ul>
      </header>
      {activity.hasComparison ? (
        <figure className="mt-6">
          <div className="flex h-40 gap-2" aria-hidden="true">
            <div className="flex w-6 shrink-0 flex-col justify-between text-right text-[11px] text-muted-foreground">
              <span>{numbers.format(maximum)}</span>
              <span>{numbers.format(maximum / 2)}</span>
              <span>0</span>
            </div>
            <svg
              viewBox="0 0 560 160"
              preserveAspectRatio="none"
              className="min-w-0 flex-1 overflow-visible"
            >
              {[0, 80, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="560"
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="3 4"
                />
              ))}
              {activity.days.map((day, index) => (
                <g key={day.date}>
                  <title>{`${formatDateOnly(day.date, i18n.resolvedLanguage)}: ${t('dashboard.created')} ${day.created}, ${t('dashboard.completed')} ${day.completed}`}</title>
                  <rect
                    x={index * step + step * 0.175}
                    y={160 - (day.created / maximum) * 152}
                    width={step * 0.3}
                    height={(day.created / maximum) * 152}
                    rx="2"
                    fill="var(--primary)"
                  />
                  <rect
                    x={index * step + step * 0.525}
                    y={160 - (day.completed / maximum) * 152}
                    width={step * 0.3}
                    height={(day.completed / maximum) * 152}
                    rx="2"
                    fill="var(--status-done)"
                  />
                </g>
              ))}
            </svg>
          </div>
          <figcaption className="mt-3 ml-8 flex justify-between gap-2 text-xs text-muted-foreground">
            <span>{dateLabel(activity.days[0])}</span>
            <span>
              {dateLabel(
                activity.days[Math.floor((activity.days.length - 1) / 2)],
              )}
            </span>
            <span>{dateLabel(activity.days.at(-1))}</span>
          </figcaption>
        </figure>
      ) : (
        <p className="my-8 text-sm text-muted-foreground">
          {t('dashboard.insufficientActivity')}
        </p>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        {t('dashboard.activityNote')}
      </p>
      <details className="mt-3 text-xs">
        <summary className="w-fit cursor-pointer rounded py-2 text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          {t('dashboard.dailyCounts')}
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left tabular-nums">
            <caption className="sr-only">
              {t('dashboard.activityTitle')}
            </caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 font-medium">
                  {t('dashboard.date')}
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  {t('dashboard.created')}
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  {t('dashboard.completed')}
                </th>
              </tr>
            </thead>
            <tbody>
              {activity.days.map((day) => (
                <tr key={day.date} className="border-b last:border-0">
                  <th scope="row" className="py-2 font-normal">
                    <time dateTime={day.date}>
                      {formatDateOnly(day.date, i18n.resolvedLanguage)}
                    </time>
                  </th>
                  <td className="text-right">{numbers.format(day.created)}</td>
                  <td className="text-right">
                    {numbers.format(day.completed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

export default DashboardTrend
