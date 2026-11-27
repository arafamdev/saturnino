import { useId } from 'react'
import { useDroppable } from '@dnd-kit/react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { taskStatusClasses } from '@/features/tasks/data/taskAppearance'
import KanbanTaskCard from './KanbanTaskCard'

function KanbanColumn({ status, tasks, onCreate, projectsById, ...cardProps }) {
  const { t } = useTranslation('app')
  const headingId = useId()
  const { ref, isDropTarget } = useDroppable({
    id: `column:${status}`,
    accept: 'task',
    data: { status, index: tasks.length },
  })
  return (
    <section
      ref={ref}
      data-column={status}
      aria-labelledby={headingId}
      className={`flex w-72 min-w-64 shrink-0 flex-col rounded-xl bg-muted/40 p-3 md:flex-1 ${isDropTarget ? 'ring-2 ring-inset ring-primary' : ''}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${taskStatusClasses[status]}`}
        />
        <h3
          id={headingId}
          className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium"
        >
          {t(`tasks.status.${status}`)}{' '}
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </h3>
        {onCreate && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 md:size-8"
            aria-label={t('kanban.createIn', {
              status: t(`tasks.status.${status}`),
            })}
            onClick={(event) => onCreate(status, event.currentTarget)}
          >
            <Plus className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <ul
        className="min-h-24 space-y-3 md:min-h-0 md:flex-1 md:overflow-y-auto"
        aria-labelledby={headingId}
      >
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
        {tasks.length === 0 && (
          <li className="py-4 text-sm text-muted-foreground">
            {t('kanban.empty')}
          </li>
        )}
      </ul>
    </section>
  )
}
export default KanbanColumn
