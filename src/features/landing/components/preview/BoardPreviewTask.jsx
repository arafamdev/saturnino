import { Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

const priorityStyles = {
  low: 'text-muted-foreground',
  medium: 'text-amber-700 dark:text-amber-400',
  high: 'text-red-700 dark:text-red-400',
}

function BoardPreviewTask({ task }) {
  const { t } = useTranslation('landing')

  const { id, priority, label } = task

  return (
    <article className="space-y-3 rounded-lg border bg-card p-3 shadow-sm">
      <span className="text-xs text-muted-foreground">
        {t(`board.labels.${label}`)}
      </span>

      <h4 className="text-sm leading-snug font-medium">
        {t(`board.tasks.${id}`)}
      </h4>

      <div
        className={cn(
          'flex items-center gap-1.5 text-xs',
          priorityStyles[priority],
        )}
      >
        <Flag className="size-3" aria-hidden="true" />
        {t(`board.priorities.${priority}`)}
      </div>
    </article>
  )
}

export default BoardPreviewTask
