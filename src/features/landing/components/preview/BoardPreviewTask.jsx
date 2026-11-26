import { Flag } from 'lucide-react'

import { cn } from '@/lib/utils'

const priorityStyles = {
  low: 'text-muted-foreground',
  medium: 'text-amber-700 dark:text-amber-400',
  high: 'text-red-700 dark:text-red-400',
}

function BoardPreviewTask({ task }) {
  const { title, priority, label } = task

  return (
    <article className="space-y-3 rounded-lg border bg-card p-3 shadow-sm">
      <span className="text-xs text-muted-foreground">{label}</span>

      <h4 className="text-sm leading-snug font-medium">{title}</h4>

      <div
        className={cn(
          'flex items-center gap-1.5 text-xs capitalize',
          priorityStyles[priority],
        )}
      >
        <Flag className="size-3" aria-hidden="true" />
        {priority}
      </div>
    </article>
  )
}

export default BoardPreviewTask
