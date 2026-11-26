import { Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function WorkspaceIndicator() {
  const { t } = useTranslation('app')

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Database className="size-4" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{t('workspace.local')}</p>

        <p className="text-xs text-muted-foreground">
          {t('workspace.localDescription')}
        </p>
      </div>
    </div>
  )
}

export default WorkspaceIndicator
