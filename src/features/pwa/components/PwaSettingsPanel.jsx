import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { version } from '../../../../package.json'
import { usePwa } from '../hooks/usePwa'

function PwaSettingsPanel() {
  const { t } = useTranslation('app')
  const id = useId()
  const {
    supported,
    needRefresh,
    offlineReady,
    isOnline,
    error,
    hasRegistration,
    isChecking,
    isUpdating,
    checkForUpdates,
  } = usePwa()
  return (
    <section
      aria-labelledby={id}
      className="space-y-4 rounded-xl border bg-card p-5"
    >
      <h2 id={id} className="text-lg font-semibold">
        {t('pwa.title')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t('pwa.installDescription')}
      </p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t('pwa.application')}</dt>
          <dd>Saturnino v{version}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t('pwa.connection')}</dt>
          <dd>{t(isOnline ? 'pwa.online' : 'pwa.offline')}</dd>
        </div>
      </dl>
      <p role="status" aria-label={t('pwa.cacheStatus')} className="text-sm">
        {t(
          !supported
            ? 'pwa.unavailable'
            : offlineReady
              ? 'pwa.ready'
              : 'pwa.preparing',
        )}
      </p>
      {error && (error !== 'updateFailed' || !needRefresh) && (
        <p role="alert" className="text-sm text-destructive">
          {t(`pwa.${error}`)}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={!hasRegistration || !isOnline || isChecking || isUpdating}
        onClick={checkForUpdates}
      >
        {t(isChecking ? 'pwa.checking' : 'pwa.check')}
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('pwa.storageNote')}
      </p>
    </section>
  )
}
export default PwaSettingsPanel
