import { useId } from 'react'
import { useDroppable } from '@dnd-kit/react'
import { useTranslation } from 'react-i18next'
import KanbanTaskCard from './KanbanTaskCard'

function KanbanColumn({ status, tasks, visible, projectsById, ...cardProps }) {
  const { t } = useTranslation('app')
  const headingId = useId()
  const { ref, isDropTarget } = useDroppable({
    id: `column:${status}`,
    accept: 'task',
    data: { status, index: tasks.length },
    collisionPriority: 0,
  })
  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      className={`${visible ? '' : 'hidden md:block'} min-w-0 rounded-xl border bg-muted/30 p-3 ${isDropTarget ? 'ring-2 ring-primary' : ''}`}
    >
      <h3
        id={headingId}
        className="mb-3 flex items-center justify-between gap-2 font-semibold"
      >
        {t(`tasks.status.${status}`)}{' '}
        <span className="rounded-full bg-muted px-2 py-1 text-xs">
          {tasks.length}
        </span>
      </h3>
      <ul className="min-h-24 space-y-3" aria-labelledby={headingId}>
        {tasks.map((task, index) => (
          <KanbanTaskCard
            key={task.id}
            task={task}
            project={projectsById.get(task.projectId)}
            index={index}
            count={tasks.length}
            {...cardProps}
          />
        ))}
      </ul>
      {tasks.length === 0 && (
        <p className="py-4 text-sm text-muted-foreground">
          {t('kanban.empty')}
        </p>
      )}
    </section>
  )
}
export default KanbanColumn
