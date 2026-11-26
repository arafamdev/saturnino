import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import BoardPreviewTask from './BoardPreviewTask'

const statusStyles = {
  backlog: 'bg-muted-foreground',
  todo: 'bg-blue-500',
  'in-progress': 'bg-primary',
  done: 'bg-emerald-500',
}

function BoardPreviewColumn({ column }) {
  const { t } = useTranslation('landing')

  const { id, tasks } = column

  return (
    <section className="min-w-0 space-y-3 rounded-xl bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn('size-2 shrink-0 rounded-full', statusStyles[id])}
        />

        <h3 className="text-sm font-medium">{t(`board.columns.${id}`)}</h3>

        <span className="ml-auto text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <BoardPreviewTask key={task.id} task={task} />
        ))}
      </div>
    </section>
  )
}

export default BoardPreviewColumn
