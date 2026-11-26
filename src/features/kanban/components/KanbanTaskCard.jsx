import { useDraggable, useDroppable } from '@dnd-kit/react'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import TaskCard from '@/features/tasks/components/TaskCard'
import { TASK_STATUSES } from '@/features/tasks/data/taskOptions'

function KanbanTaskCard({
  task,
  project,
  index,
  count,
  busy,
  movementRestricted = false,
  onMove,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation('app')
  const { ref, handleRef, isDragSource } = useDraggable({
    id: task.id,
    type: 'task',
    data: { task },
    disabled: busy || movementRestricted,
  })
  const { ref: targetRef, isDropTarget } = useDroppable({
    id: `task-target:${task.id}`,
    accept: (source) => source.type === 'task' && source.id !== task.id,
    collisionPriority: 10,
    data: { status: task.status, index, title: task.title },
  })
  const focusProps = (kind) => ({
    'data-task-focus': kind,
    'data-task-id': task.id,
  })
  return (
    <li
      ref={targetRef}
      className={isDropTarget ? 'rounded-xl ring-2 ring-primary' : ''}
    >
      <TaskCard
        ref={ref}
        task={task}
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        headingLevel={4}
        dragHandle={
          <Button
            ref={handleRef}
            type="button"
            variant="ghost"
            className="mb-2 min-h-11 touch-none"
            disabled={busy || movementRestricted}
            aria-label={t('kanban.drag', { title: task.title })}
            {...focusProps('handle')}
          >
            <GripVertical aria-hidden="true" />
            <span>
              {t(isDragSource ? 'kanban.dragging' : 'kanban.dragShort')}
            </span>
          </Button>
        }
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="min-w-0 flex-1 text-xs text-muted-foreground">
            {t('kanban.moveTo')}
            <select
              className="mt-1 min-h-11 w-full rounded-md border bg-background px-2 text-sm text-foreground"
              aria-label={t('kanban.moveNamed', { title: task.title })}
              value={task.status}
              disabled={busy}
              {...focusProps('select')}
              onChange={(event) =>
                onMove(task, event.target.value, 0, 'select')
              }
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`tasks.status.${status}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-1">
            <Button
              type="button"
              variant="outline"
              className="size-11"
              disabled={busy}
              aria-disabled={index === 0 || movementRestricted}
              aria-label={t('kanban.up', { title: task.title })}
              {...focusProps('up')}
              onClick={() => {
                if (!movementRestricted && index > 0)
                  onMove(task, task.status, index - 1, 'up')
              }}
            >
              <ArrowUp aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="size-11"
              disabled={busy}
              aria-disabled={index === count - 1 || movementRestricted}
              aria-label={t('kanban.down', { title: task.title })}
              {...focusProps('down')}
              onClick={() => {
                if (!movementRestricted && index < count - 1)
                  onMove(task, task.status, index + 1, 'down')
              }}
            >
              <ArrowDown aria-hidden="true" />
            </Button>
          </div>
        </div>
      </TaskCard>
    </li>
  )
}
export default KanbanTaskCard
