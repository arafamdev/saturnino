import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { usePwa } from '../hooks/usePwa'

function PwaUpdateBanner() {
  const { t } = useTranslation('app')
  const {
    needRefresh,
    isChecking,
    isUpdating,
    error,
    applyUpdate,
    dismissUpdate,
  } = usePwa()
  if (!needRefresh) return null
  return (
    <aside
      aria-label={t('pwa.updateTitle')}
      className="fixed right-4 bottom-4 left-4 z-40 space-y-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xl sm:left-auto sm:max-w-sm"
    >
      <div role="status">
        <h2 className="font-semibold">{t('pwa.updateTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('pwa.updateDescription')}
        </p>
      </div>
      {error === 'updateFailed' && (
        <p role="alert" className="text-sm text-destructive">
          {t('pwa.updateFailed')}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={isChecking || isUpdating}
          onClick={dismissUpdate}
        >
          {t('pwa.later')}
        </Button>
        <Button
          type="button"
          className="min-h-11"
          disabled={isChecking || isUpdating}
          onClick={applyUpdate}
        >
          {t(isUpdating ? 'pwa.updating' : 'pwa.reload')}
        </Button>
      </div>
    </aside>
  )
}
export default PwaUpdateBanner
