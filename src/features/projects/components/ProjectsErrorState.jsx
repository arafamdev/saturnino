import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

function ProjectsErrorState({ onRetry }) {
  const { t } = useTranslation('app')

  return (
    <section
      role="alert"
      className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-6 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('projects.errors.loadTitle')}
        </h2>

        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t('projects.errors.loadFailed')}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="min-h-11 px-4"
      >
        <RefreshCw aria-hidden="true" />
        {t('projects.actions.retry')}
      </Button>
    </section>
  )
}

export default ProjectsErrorState
