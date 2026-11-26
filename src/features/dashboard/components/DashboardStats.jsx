import { useTranslation } from 'react-i18next'
import {
  CheckCheck,
  Clock3,
  FolderKanban,
  ListTodo,
  Percent,
  TriangleAlert,
} from 'lucide-react'
import { TASK_STATUSES } from '@/features/tasks/data/taskOptions'

const metrics = [
  ['projects', 'projectCount', FolderKanban],
  ['tasks', 'taskCount', ListTodo],
  ['open', 'open', Clock3],
  ['completed', 'completed', CheckCheck],
  ['overdue', 'overdue', TriangleAlert],
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
    <div className="space-y-6">
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, field, Icon]) => (
          <div key={field} className="min-w-0 rounded-xl border bg-card p-5">
            <dt className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              {t(`dashboard.metrics.${label}`)}
              <Icon className="size-5 text-primary" aria-hidden="true" />
            </dt>
            <dd className="mt-3 text-3xl font-semibold tabular-nums">
              {field === 'completionRate'
                ? percent.format(summary[field] / 100)
                : numbers.format(summary[field])}
            </dd>
          </div>
        ))}
      </dl>
      <section
        aria-labelledby="dashboard-status-heading"
        className="rounded-xl border bg-card p-5"
      >
        <h2 id="dashboard-status-heading" className="text-lg font-semibold">
          {t('dashboard.distribution')}
        </h2>
        {summary.taskCount === 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t('dashboard.noTasks')}
          </p>
        )}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {TASK_STATUSES.map((status) => {
            const count = summary.statusCounts[status]
            const share = summary.taskCount ? count / summary.taskCount : 0
            return (
              <li key={status} className="space-y-2">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span>{t(`tasks.status.${status}`)}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {numbers.format(count)} · {percent.format(share)}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${share * 100}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
export default DashboardStats
