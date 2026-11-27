import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useTodayDateOnly } from '@/lib/dates/useTodayDateOnly'
import { useWorkspaceSnapshot } from '@/lib/db/useWorkspaceSnapshot'
import { buildDashboardSummary } from '../utils/buildDashboardSummary'
import DashboardStats from '../components/DashboardStats'
import DashboardProjectProgress from '../components/DashboardProjectProgress'
import DashboardTaskWatch from '../components/DashboardTaskWatch'
import DashboardDistributions from '../components/DashboardDistributions'
import DashboardTrend from '../components/DashboardTrend'

function OverviewPage() {
  const { t } = useTranslation('app')
  const today = useTodayDateOnly()
  const query = useWorkspaceSnapshot()
  const summary = query.snapshot
    ? buildDashboardSummary(query.snapshot, today)
    : null
  return (
    <div className="min-w-0 space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('navigation.overview')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </header>
      {query.isError ? (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-destructive/30 p-5"
        >
          <h2 className="font-semibold">{t('dashboard.errorTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.errorDescription')}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={query.retry}
          >
            {t('tasks.actions.retry')}
          </Button>
        </div>
      ) : query.isLoading ? (
        <p role="status" className="py-8 text-sm text-muted-foreground">
          {t('dashboard.loading')}
        </p>
      ) : (
        <>
          {summary.projectCount === 0 && (
            <section className="space-y-3 rounded-xl border border-dashed p-4">
              <h2 className="font-semibold">{t('dashboard.welcome')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.startDescription')}
              </p>
              <Button asChild className="min-h-11">
                <Link to="/app/projects">{t('dashboard.startAction')}</Link>
              </Button>
            </section>
          )}
          <DashboardStats summary={summary} />
          <DashboardDistributions summary={summary} />
          <div
            className={
              summary.taskCount > 0
                ? 'grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]'
                : ''
            }
          >
            {summary.taskCount > 0 && (
              <DashboardTrend activity={summary.activity} />
            )}
            <DashboardTaskWatch summary={summary} />
          </div>
          <DashboardProjectProgress summary={summary} />
        </>
      )}
    </div>
  )
}
export default OverviewPage
