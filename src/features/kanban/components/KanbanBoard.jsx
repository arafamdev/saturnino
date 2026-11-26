import { useEffect, useMemo, useRef, useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import {
  Accessibility,
  Feedback,
  PointerSensor,
  PointerActivationConstraints,
} from '@dnd-kit/dom'
import { useTranslation } from 'react-i18next'

import { TASK_STATUSES } from '@/features/tasks/data/taskOptions'
import { taskRepository } from '@/features/tasks/services/taskRepository'
import KanbanColumn from './KanbanColumn'

function sensors(defaults) {
  return [
    ...defaults.filter((sensor) => sensor !== PointerSensor),
    PointerSensor.configure({
      activationConstraints(event) {
        return event.pointerType === 'touch'
          ? [
              new PointerActivationConstraints.Delay({
                value: 250,
                tolerance: 5,
              }),
            ]
          : [new PointerActivationConstraints.Distance({ value: 5 })]
      },
    }),
  ]
}

function KanbanBoard({ projectId, tasks, projects, onEdit, onDelete }) {
  const { t } = useTranslation('app')
  const [column, setColumn] = useState('todo')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const pending = useRef(false)
  const focusRequest = useRef(null)
  const boardRef = useRef(null)
  const projectsById = new Map(projects.map((project) => [project.id, project]))
  const plugins = useMemo(
    () => (defaults) => [
      ...defaults,
      Feedback.configure({ dropAnimation: null, keyboardTransition: null }),
      Accessibility.configure({
        screenReaderInstructions: { draggable: t('kanban.instructions') },
        announcements: {
          dragstart: ({ operation }) =>
            t('kanban.started', {
              title: operation.source?.data.task?.title ?? '',
            }),
          dragover: ({ operation }) =>
            operation.target
              ? t('kanban.over', {
                  status: t(`tasks.status.${operation.target.data.status}`),
                })
              : undefined,
          dragend: ({ canceled }) =>
            t(canceled ? 'kanban.cancelled' : 'kanban.requested'),
        },
      }),
    ],
    [t],
  )

  useEffect(() => {
    const request = focusRequest.current
    if (
      !request ||
      busy ||
      !tasks.some(
        (task) =>
          task.id === request.id &&
          task.status === request.status &&
          task.position === request.position,
      )
    )
      return
    const control = Array.from(
      boardRef.current?.querySelectorAll('[data-task-focus]') ?? [],
    ).find(
      (element) =>
        element.dataset.taskId === request.id &&
        element.dataset.taskFocus === request.kind,
    )
    if (control) {
      control.focus()
      focusRequest.current = null
    }
  }, [tasks, busy])

  async function move(task, status, index, kind = 'handle') {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const result = await taskRepository.moveTask(task.id, {
        projectId,
        status,
        index,
        expectedUpdatedAt: task.updatedAt,
      })
      focusRequest.current = {
        id: task.id,
        status: result.status,
        position: result.position,
        kind,
      }
      setColumn(result.status)
      setAnnouncement(
        t('kanban.moved', {
          title: task.title,
          status: t(`tasks.status.${result.status}`),
        }),
      )
    } catch (cause) {
      setError(
        t(
          cause.message === 'TASK_MOVE_CONFLICT'
            ? 'kanban.conflict'
            : 'kanban.failed',
        ),
      )
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function handleDragEnd({ canceled, operation }) {
    if (canceled || !operation.source || !operation.target) return
    const task = operation.source.data.task
    const { status, index } = operation.target.data
    if (
      !task ||
      !TASK_STATUSES.includes(status) ||
      !Number.isSafeInteger(index)
    )
      return
    const count = tasks.filter(
      (item) => item.status === status && item.id !== task.id,
    ).length
    void move(task, status, Math.min(index, count))
  }

  return (
    <div ref={boardRef} className="relative min-w-0 space-y-4" aria-busy={busy}>
      <p
        role="status"
        aria-label={t('kanban.view')}
        className="sr-only absolute top-0 left-0"
      >
        {busy ? t('kanban.saving') : announcement}
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <label className="block text-sm font-medium md:hidden">
        {t('kanban.column')}
        <select
          className="mt-2 min-h-11 w-full rounded-md border bg-background px-3"
          value={column}
          onChange={(event) => setColumn(event.target.value)}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`tasks.status.${status}`)}
            </option>
          ))}
        </select>
      </label>
      <DragDropProvider
        sensors={sensors}
        plugins={plugins}
        onBeforeDragStart={(event) => {
          if (pending.current) event.preventDefault()
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="grid min-w-0 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
              visible={column === status}
              projectsById={projectsById}
              busy={busy}
              onMove={move}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  )
}
export default KanbanBoard
