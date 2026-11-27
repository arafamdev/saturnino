import { Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function WorkspaceIndicator() {
  const { t } = useTranslation('app')

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background p-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Database className="size-4" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p
          title={t('workspace.local')}
          className="truncate text-xs font-medium"
        >
          {t('workspace.local')}
        </p>

        <p className="text-xs text-muted-foreground">
          {t('workspace.localDescription')}
        </p>
      </div>
    </div>
  )
}

export default WorkspaceIndicator
