import { Tabs } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateOnly } from '@/lib/dates/dateOnly'

const modes = ['upcoming', 'overdue', 'recent']

function DashboardTaskWatch({ summary }) {
  const { t, i18n } = useTranslation('app')
  const timestamp = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const projects = new Map(
    summary.projectProgress.map((project) => [project.id, project.name]),
  )
  const lists = {
    upcoming: summary.upcoming,
    overdue: summary.overdueTasks,
    recent: summary.recentTasks,
  }
  const destinations = {
    upcoming: '/app/tasks?sort=dueDate',
    overdue: '/app/tasks?due=overdue&sort=dueDate',
    recent: '/app/tasks?sort=updated',
  }
  return (
    <section
      aria-labelledby="dashboard-task-watch-heading"
      className="min-w-0 rounded-xl border bg-card p-4 sm:p-5"
    >
      <h2
        id="dashboard-task-watch-heading"
        className="text-base font-semibold tracking-tight"
      >
        {t('dashboard.taskWatch')}
      </h2>
      <Tabs.Root defaultValue="upcoming" className="mt-4">
        <Tabs.List
          aria-label={t('dashboard.taskWatch')}
          className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1"
        >
          {modes.map((mode) => (
            <Tabs.Trigger
              key={mode}
              value={mode}
              className="min-h-10 min-w-0 rounded-md px-2 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              {t(`dashboard.watchTabs.${mode}`)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {modes.map((mode) => (
          <Tabs.Content
            key={mode}
            value={mode}
            className="mt-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h3 className="sr-only">{t(`dashboard.watchTitles.${mode}`)}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t(`dashboard.watchDescriptions.${mode}`)}
            </p>
            {lists[mode].length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                {t(`dashboard.watchEmpty.${mode}`)}
              </p>
            ) : (
              <ul className="mt-2 divide-y">
                {lists[mode].map((task) => (
                  <li key={task.id} className="min-w-0 py-3">
                    <Link
                      to={`/app/projects/${task.projectId}`}
                      className="inline-block min-h-9 max-w-full content-center rounded text-sm font-medium wrap-anywhere hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {task.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="min-w-0 wrap-break-word">
                        {projects.get(task.projectId) ??
                          t('tasks.unknownProject')}
                      </span>
                      <time
                        dateTime={
                          mode === 'recent' ? task.updatedAt : task.dueDate
                        }
                        className={
                          mode === 'overdue' ? 'text-priority-high' : ''
                        }
                      >
                        {mode === 'recent'
                          ? timestamp.format(new Date(task.updatedAt))
                          : formatDateOnly(task.dueDate, i18n.resolvedLanguage)}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={destinations[mode]}
              className="mt-2 inline-flex min-h-11 items-center rounded text-xs font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {t('dashboard.viewTasks')}
            </Link>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  )
}

export default DashboardTaskWatch
