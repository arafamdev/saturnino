import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import {
  taskPriorityClasses,
  taskStatusClasses,
} from '@/features/tasks/data/taskAppearance'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '@/features/tasks/data/taskOptions'

const statusColors = [
  'var(--muted-foreground)',
  'var(--status-todo)',
  'var(--primary)',
  'var(--status-done)',
]
const circumference = 2 * Math.PI * 44

function StatusRing({ counts, total, totalLabel }) {
  return (
    <div className="relative size-28 shrink-0" aria-hidden="true">
      <svg viewBox="0 0 112 112" className="size-full -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="44"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="12"
        />
        {TASK_STATUSES.map((status, index) => {
          const length = total ? (counts[status] / total) * circumference : 0
          const start =
            (TASK_STATUSES.slice(0, index).reduce(
              (sum, previous) => sum + counts[previous],
              0,
            ) /
              Math.max(total, 1)) *
            circumference
          return (
            <circle
              key={status}
              cx="56"
              cy="56"
              r="44"
              fill="none"
              stroke={statusColors[index]}
              strokeWidth="12"
              strokeDasharray={`${length} ${circumference}`}
              strokeDashoffset={-start}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">{totalLabel}</span>
      </div>
    </div>
  )
}

const itemClass =
  'flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-2 text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

function DashboardDistributions({ summary }) {
  const { t, i18n } = useTranslation('app')
  const numbers = new Intl.NumberFormat(i18n.resolvedLanguage)
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      <section
        aria-labelledby="dashboard-status-heading"
        className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"
      >
        <h2
          id="dashboard-status-heading"
          className="text-base font-semibold tracking-tight"
        >
          {t('dashboard.distribution')}
        </h2>
        {summary.taskCount === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t('dashboard.noTasks')}
          </p>
        ) : (
          <div className="mt-4 flex items-center gap-3 sm:gap-5">
            <StatusRing
              counts={summary.statusCounts}
              total={summary.taskCount}
              totalLabel={t('dashboard.total')}
            />
            <ul className="min-w-0 flex-1">
              {TASK_STATUSES.map((status) => (
                <li key={status}>
                  <Link
                    to={`/app/tasks?status=${status}`}
                    className={itemClass}
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${taskStatusClasses[status]}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 wrap-break-word">
                      {t(`tasks.status.${status}`)}
                    </span>
                    <span className="font-medium tabular-nums">
                      {numbers.format(summary.statusCounts[status])}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section
        aria-labelledby="dashboard-priority-heading"
        className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"
      >
        <h2
          id="dashboard-priority-heading"
          className="text-base font-semibold tracking-tight"
        >
          {t('dashboard.priorityDistribution')}
        </h2>
        {summary.taskCount === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t('dashboard.noTasks')}
          </p>
        ) : (
          <ul className="mt-4 space-y-1">
            {TASK_PRIORITIES.toReversed().map((priority) => {
              const count = summary.priorityCounts[priority]
              const share = count / summary.taskCount
              return (
                <li key={priority}>
                  <Link
                    to={`/app/tasks?priority=${priority}`}
                    className="block min-h-11 space-y-1.5 rounded-lg px-2 py-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <div className="flex justify-between gap-3 text-xs">
                      <span>{t(`tasks.priority.${priority}`)}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {numbers.format(count)} · {percent.format(share)}
                      </span>
                    </div>
                    <div
                      className={`h-1.5 overflow-hidden rounded-full bg-muted ${taskPriorityClasses[priority]}`}
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-current"
                        style={{ width: `${share * 100}%` }}
                      />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default DashboardDistributions
