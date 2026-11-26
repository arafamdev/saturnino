import { AlertDialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

function RestoreBackupDialog({
  preview,
  busy,
  error,
  onCancel,
  onRestore,
  onCloseAutoFocus,
}) {
  const { t, i18n } = useTranslation('app')
  return (
    <AlertDialog.Root
      open={Boolean(preview)}
      onOpenChange={(open) => {
        if (!open && !busy) onCancel()
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <AlertDialog.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
        >
          <AlertDialog.Title className="text-lg font-semibold">
            {t('dataManagement.restoreTitle')}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            {t('dataManagement.restoreDescription')}
          </AlertDialog.Description>
          {preview && (
            <div className="mt-4 space-y-3 text-sm">
              <p className="wrap-break-word">{preview.filename}</p>
              <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted p-3">
                <div>
                  <dt className="text-muted-foreground">
                    {t('dataManagement.current')}
                  </dt>
                  <dd>
                    {t('dataManagement.counts', {
                      projects: preview.currentProjectCount,
                      tasks: preview.currentTaskCount,
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {t('dataManagement.backup')}
                  </dt>
                  <dd>
                    {t('dataManagement.counts', {
                      projects: preview.backup.projects.length,
                      tasks: preview.backup.tasks.length,
                    })}
                  </dd>
                </div>
              </dl>
              <p className="text-muted-foreground">
                {t('dataManagement.exportedAt', {
                  date: new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(preview.backup.exportedAt)),
                })}
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {t(`dataManagement.errors.${error}`)}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={busy}
              >
                {t('tasks.actions.cancel')}
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              disabled={busy || error === 'WORKSPACE_CHANGED'}
              onClick={onRestore}
            >
              {t(
                busy
                  ? 'dataManagement.restoring'
                  : 'dataManagement.confirmRestore',
              )}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
export default RestoreBackupDialog
