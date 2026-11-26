import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { formatDateOnly, getTodayDateOnly } from '@/lib/dates/dateOnly'

import { isTaskOverdue } from '../utils/selectTasks'

function TaskCard({
  ref,
  task,
  project,
  onEdit,
  onDelete,
  dragHandle,
  children,
  headingLevel = 3,
}) {
  const { t, i18n } = useTranslation('app')
  const Heading = headingLevel === 4 ? 'h4' : 'h3'
  return (
    <article
      ref={ref}
      className="min-w-0 rounded-xl border bg-card p-4 text-card-foreground sm:p-5"
    >
      {dragHandle}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Heading className="font-semibold wrap-break-word">
            {task.title}
          </Heading>
          {task.description && (
            <p className="text-sm whitespace-pre-wrap wrap-break-word text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label={t('tasks.actions.editNamed', {
              title: task.title,
            })}
            onClick={(event) => onEdit(task, event.currentTarget)}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 text-destructive"
            aria-label={t('tasks.actions.deleteNamed', {
              title: task.title,
            })}
            onClick={(event) => onDelete(task, event.currentTarget)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <Link
          to={`/app/projects/${task.projectId}`}
          className="max-w-full truncate rounded border px-2 py-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {project?.name ?? t('tasks.unknownProject')}
        </Link>
        <span className="rounded bg-primary/10 px-2 py-1 text-primary">
          {t(`tasks.status.${task.status}`)}
        </span>
        <span className="rounded bg-muted px-2 py-1">
          {t('tasks.form.priority')}: {t(`tasks.priority.${task.priority}`)}
        </span>
        {task.dueDate && (
          <time dateTime={task.dueDate} className="text-muted-foreground">
            {t('tasks.due', {
              date: formatDateOnly(task.dueDate, i18n.resolvedLanguage),
            })}
          </time>
        )}
      </div>
      {isTaskOverdue(task, getTodayDateOnly()) && (
        <p className="mt-2 text-xs font-medium text-destructive">
          {t('filters.overdue')}
        </p>
      )}
      {children}
    </article>
  )
}

export default TaskCard
