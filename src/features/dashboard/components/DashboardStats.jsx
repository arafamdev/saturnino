import {
  ArrowUpRight,
  CheckCheck,
  Clock3,
  FolderKanban,
  ListTodo,
  Percent,
  TriangleAlert,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const metrics = [
  ['projects', 'projectCount', FolderKanban, '/app/projects'],
  ['tasks', 'taskCount', ListTodo, '/app/tasks'],
  ['open', 'open', Clock3],
  ['completed', 'completed', CheckCheck, '/app/tasks?status=done'],
  ['overdue', 'overdue', TriangleAlert, '/app/tasks?due=overdue'],
  ['completion', 'completionRate', Percent],
]

function DashboardStats({ summary }) {
  const { t, i18n } = useTranslation('app')
  const numbers = new Intl.NumberFormat(i18n.resolvedLanguage)
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {metrics.map(([label, field, Icon, href]) => (
        <div
          key={field}
          className={`relative min-w-0 rounded-xl border bg-card p-4 ${href ? 'transition-colors hover:border-primary/50' : ''}`}
        >
          <dt className="flex items-start justify-between gap-2 text-xs leading-5 text-muted-foreground">
            {href ? (
              <Link
                to={href}
                className="rounded-sm after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
              >
                {t(`dashboard.metrics.${label}`)}
              </Link>
            ) : (
              t(`dashboard.metrics.${label}`)
            )}
            <Icon
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
          </dt>
          <dd
            className={`mt-3 text-2xl leading-8 font-semibold tabular-nums ${field === 'overdue' && summary.overdue ? 'text-priority-high' : ''}`}
          >
            {field === 'completionRate'
              ? percent.format(summary[field] / 100)
              : numbers.format(summary[field])}
          </dd>
          {href && (
            <ArrowUpRight
              className="absolute right-4 bottom-4 size-3 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </dl>
  )
}

export default DashboardStats
