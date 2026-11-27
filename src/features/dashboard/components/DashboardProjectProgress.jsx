import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

const linkClass =
  'min-w-0 rounded-sm font-medium wrap-anywhere hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

function DashboardProjectProgress({ summary }) {
  const { t, i18n } = useTranslation('app')
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  return (
    <section
      aria-labelledby="dashboard-projects-heading"
      className="min-w-0 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="dashboard-projects-heading" className="text-base font-semibold">
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
        <ul
          className={`mt-4 grid gap-4 ${summary.projectProgress.length > 1 ? 'sm:grid-cols-2' : ''} ${summary.projectProgress.length > 2 ? 'xl:grid-cols-3' : ''}`}
        >
          {summary.projectProgress.slice(0, 6).map((project) => (
            <li
              key={project.id}
              className="min-w-0 space-y-2 rounded-lg bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <Link to={`/app/projects/${project.id}`} className={linkClass}>
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
  )
}
export default DashboardProjectProgress
