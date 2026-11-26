import { CalendarDays, Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { formatDateOnly, getTodayDateOnly } from '@/lib/dates/dateOnly'

import { isTaskOverdue } from '../utils/selectTasks'
import TaskActionsMenu from './TaskActionsMenu'

function TaskCard({
  ref,
  task,
  project,
  onEdit,
  onDelete,
  dragHandle,
  children,
  actions,
  headingLevel = 3,
  today = getTodayDateOnly(),
}) {
  const { t, i18n } = useTranslation('app')
  const Heading = headingLevel === 4 ? 'h4' : 'h3'
  const isBoard = headingLevel === 4
  const overdue = isTaskOverdue(task, today)
  const priorityClass = {
    low: 'text-muted-foreground',
    medium: 'text-amber-600 dark:text-amber-400',
    high: 'text-red-600 dark:text-red-400',
    urgent: 'text-red-700 dark:text-red-300',
  }[task.priority]
  return (
    <article
      ref={ref}
      className="relative min-w-0 rounded-lg border bg-card p-3 text-card-foreground shadow-xs"
    >
      <div className="flex items-start gap-1">
        {dragHandle}
        <Heading className="min-w-0 flex-1 text-sm leading-snug font-medium wrap-break-word">
          <button
            type="button"
            onClick={(event) => onEdit(task, event.currentTarget)}
            className="min-h-11 w-full rounded text-left hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:min-h-8"
          >
            {task.title}
          </button>
        </Heading>
        {actions ?? (
          <TaskActionsMenu task={task} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
      {!isBoard && task.description && (
        <p className="mt-1 line-clamp-2 text-sm whitespace-pre-wrap wrap-break-word text-muted-foreground">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        {!isBoard && (
          <>
            <Link
              to={`/app/projects/${task.projectId}`}
              className="max-w-full truncate rounded hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {project?.name ?? t('tasks.unknownProject')}
            </Link>
            <span>{t(`tasks.status.${task.status}`)}</span>
          </>
        )}
        <span className={`inline-flex items-center gap-1 ${priorityClass}`}>
          <Flag className="size-3" aria-hidden="true" />
          <span className="sr-only">{t('tasks.form.priority')}: </span>
          {t(`tasks.priority.${task.priority}`)}
        </span>
        {task.dueDate && (
          <time
            dateTime={task.dueDate}
            className={`inline-flex items-center gap-1 ${overdue ? 'text-destructive' : ''}`}
          >
            <CalendarDays className="size-3" aria-hidden="true" />
            {t('tasks.due', {
              date: formatDateOnly(task.dueDate, i18n.resolvedLanguage),
            })}
          </time>
        )}
        {overdue && (
          <span className="font-medium text-destructive">
            {t('filters.overdue')}
          </span>
        )}
      </div>
      {children}
    </article>
  )
}

export default TaskCard
