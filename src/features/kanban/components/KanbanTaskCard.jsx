import { useRef } from 'react'

import { useDraggable, useDroppable, useDragDropMonitor } from '@dnd-kit/react'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import TaskActionsMenu, {
  taskMenuItemClass,
} from '@/features/tasks/components/TaskActionsMenu'
import TaskCard from '@/features/tasks/components/TaskCard'
import { TASK_STATUSES } from '@/features/tasks/data/taskOptions'

function KanbanTaskCard({
  task,
  project,
  index,
  count,
  busy,
  movementRestricted = false,
  today,
  onMove,
  onEdit,
  onDelete,
}) {
  const { t } = useTranslation('app')
  const dragged = useRef(false)
  useDragDropMonitor({
    onDragStart({ operation }) {
      if (operation.source?.id === task.id) dragged.current = true
    },
  })
  const { ref, handleRef, isDragSource } = useDraggable({
    id: task.id,
    type: 'task',
    data: { task },
    disabled: busy || movementRestricted,
  })
  const { ref: targetRef, isDropTarget } = useDroppable({
    id: `task-target:${task.id}`,
    accept: (source) => source.type === 'task' && source.id !== task.id,
    data: { status: task.status, index, title: task.title },
  })
  return (
    <li
      ref={targetRef}
      data-task-drop-target={isDropTarget || undefined}
      className={`relative ${isDragSource ? 'opacity-40' : ''}`}
    >
      {isDropTarget && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 right-0 left-0 z-10 h-0.5 rounded-full bg-primary before:absolute before:-top-0.5 before:-left-0.5 before:size-1.5 before:rounded-full before:bg-primary"
        />
      )}
      <TaskCard
        ref={ref}
        className={
          busy || movementRestricted ? '' : 'cursor-grab active:cursor-grabbing'
        }
        task={task}
        today={today}
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        onTitlePointerDown={() => {
          dragged.current = false
        }}
        onTitleClick={(event) => {
          // Ignore the click synthesized when releasing or cancelling a drag.
          if (event.detail > 0 && dragged.current) return
          onEdit(task, event.currentTarget)
        }}
        headingLevel={4}
        actions={
          <TaskActionsMenu
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            busy={busy}
          >
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Label className="px-2 py-1 text-xs text-muted-foreground">
              {t('kanban.moveTo')}
            </DropdownMenu.Label>
            {TASK_STATUSES.map((status) => (
              <DropdownMenu.Item
                key={status}
                className={taskMenuItemClass}
                disabled={status === task.status}
                onSelect={() => onMove(task, status, 0, 'menu')}
              >
                {t(`tasks.status.${status}`)}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator className="my-1 h-px bg-border" />
            <DropdownMenu.Item
              className={taskMenuItemClass}
              disabled={index === 0 || movementRestricted}
              onSelect={() => onMove(task, task.status, index - 1, 'menu')}
            >
              <ArrowUp className="size-4" aria-hidden="true" />
              {t('kanban.up', { title: task.title })}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={taskMenuItemClass}
              disabled={index === count - 1 || movementRestricted}
              onSelect={() => onMove(task, task.status, index + 1, 'menu')}
            >
              <ArrowDown className="size-4" aria-hidden="true" />
              {t('kanban.down', { title: task.title })}
            </DropdownMenu.Item>
          </TaskActionsMenu>
        }
        dragHandle={
          <Button
            ref={handleRef}
            type="button"
            variant="ghost"
            className="size-11 shrink-0 touch-none cursor-grab px-0 text-muted-foreground active:cursor-grabbing md:size-8"
            disabled={busy || movementRestricted}
            aria-label={t('kanban.drag', { title: task.title })}
            data-task-focus="handle"
            data-task-id={task.id}
          >
            <GripVertical aria-hidden="true" />
          </Button>
        }
      />
    </li>
  )
}
export default KanbanTaskCard
