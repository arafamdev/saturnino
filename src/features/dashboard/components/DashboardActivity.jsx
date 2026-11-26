import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { formatDateOnly } from '@/lib/dates/dateOnly'

const linkClass =
  'rounded-sm font-medium wrap-break-word hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

function DashboardActivity({ summary }) {
  const { t, i18n } = useTranslation('app')
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const projectsById = new Map(
    summary.projectProgress.map((project) => [project.id, project]),
  )
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <section
        aria-labelledby="dashboard-projects-heading"
        className="min-w-0 rounded-xl border bg-card p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="dashboard-projects-heading" className="text-lg font-semibold">
            {t('dashboard.projectProgress')}
          </h2>
          <Link
            to="/app/projects"
            className={`${linkClass} inline-flex min-h-11 items-center text-sm`}
          >
            {t('dashboard.allProjects')}
          </Link>
        </div>
        {summary.projectProgress.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t('dashboard.noProjects')}
          </p>
        ) : (
          <ul className="mt-4 space-y-5">
            {summary.projectProgress.slice(0, 6).map((project) => (
              <li key={project.id} className="min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/app/projects/${project.id}`}
                    className={linkClass}
                  >
                    {project.name}
                  </Link>
                  <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                    {percent.format(project.progress / 100)}
                  </span>
                </div>
                <progress
                  className="h-2 w-full accent-primary"
                  aria-label={t('dashboard.progressNamed', {
                    name: project.name,
                  })}
                  max={Math.max(project.taskCount, 1)}
                  value={project.completedCount}
                />
                <p className="text-xs text-muted-foreground">
                  {project.taskCount === 0
                    ? t('dashboard.projectEmpty')
                    : t('dashboard.projectCount', {
                        completed: project.completedCount,
                        total: project.taskCount,
                      })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section
        aria-labelledby="dashboard-deadlines-heading"
        className="min-w-0 rounded-xl border bg-card p-5"
      >
        <h2 id="dashboard-deadlines-heading" className="text-lg font-semibold">
          {t('dashboard.upcoming')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('dashboard.upcomingDescription')}
        </p>
        {summary.upcoming.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            {t('dashboard.noDeadlines')}
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {summary.upcoming.map((task) => (
              <li key={task.id} className="min-w-0 space-y-2 py-3">
                <Link
                  to={`/app/projects/${task.projectId}`}
                  className={linkClass}
                >
                  {task.title}
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="max-w-full wrap-break-word">
                    {projectsById.get(task.projectId)?.name ??
                      t('tasks.unknownProject')}
                  </span>
                  <time dateTime={task.dueDate}>
                    {formatDateOnly(task.dueDate, i18n.resolvedLanguage)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
export default DashboardActivity
