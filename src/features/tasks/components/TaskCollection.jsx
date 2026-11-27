import { lazy, Suspense, useId, useRef, useState } from 'react'

import { Columns3, List, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import ProjectWorkspaceHeader from '@/features/projects/components/ProjectWorkspaceHeader'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useTodayDateOnly } from '@/lib/dates/useTodayDateOnly'
import {
  DEFAULT_TASK_FILTERS,
  hasTaskFilters,
  selectTasks,
} from '../utils/selectTasks'

import { useTasks } from '../hooks/useTasks'
import { useProjectTaskView } from '../hooks/useProjectTaskView'

import DeleteTaskDialog from './DeleteTaskDialog'
import TaskDialog from './TaskDialog'
import TaskDetailsPanel from './TaskDetailsPanel'
import TaskFilters from './TaskFilters'
import TaskList from './TaskList'

const KanbanBoard = lazy(
  () => import('@/features/kanban/components/KanbanBoard'),
)

function TaskCollection({ projectId, project }) {
  const { t, i18n } = useTranslation('app')
  const headingId = useId()
  const today = useTodayDateOnly()
  const taskQuery = useTasks(projectId)
  const projectQuery = useProjects()
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS)
  const [view, setView] = useProjectTaskView(projectId)
  const [activeDialog, setActiveDialog] = useState(null)
  const createButtonRef = useRef(null)
  const actionTriggerRef = useRef(null)

  const isLoading = taskQuery.isLoading || projectQuery.isLoading
  const isError = taskQuery.isError || projectQuery.isError
  const visibleTasks = selectTasks(taskQuery.tasks, filters, {
    today,
    locale: i18n.resolvedLanguage,
  })
  const movementRestricted =
    hasTaskFilters(filters) || filters.sort !== 'manual'
  const canCreate = !isLoading && !isError && projectQuery.projects.length > 0
  const isTaskDialogOpen = activeDialog?.type === 'create'

  function openDialog(type, task = null, trigger = null, initialStatus) {
    actionTriggerRef.current = trigger
    setActiveDialog({ type, task, initialStatus })
  }

  function handleOpenChange(open) {
    if (!open) setActiveDialog(null)
  }

  function restoreFocus(event) {
    const target = actionTriggerRef.current?.isConnected
      ? actionTriggerRef.current
      : createButtonRef.current
    if (target && !target.disabled) {
      event.preventDefault()
      target.focus()
    }
  }

  function retry() {
    taskQuery.retry()
    projectQuery.retry()
  }

  function renderTasks() {
    if (isError)
      return (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-destructive/30 p-5"
        >
          <h3 className="font-semibold">{t('tasks.errors.loadTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('tasks.errors.loadFailed')}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={retry}
            className="min-h-11"
          >
            {t('tasks.actions.retry')}
          </Button>
        </div>
      )
    if (isLoading)
      return (
        <p role="status" className="py-8 text-sm text-muted-foreground">
          {t('tasks.loading')}
        </p>
      )
    if (projectQuery.projects.length === 0)
      return (
        <div className="space-y-3 rounded-xl border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('tasks.noProjects')}
          </p>
          <Button asChild variant="outline">
            <Link to="/app/projects">{t('tasks.manageProjects')}</Link>
          </Button>
        </div>
      )
    if (projectId && view === 'board')
      return (
        <Suspense fallback={<p role="status">{t('tasks.loading')}</p>}>
          <KanbanBoard
            projectId={projectId}
            onCreate={(status, trigger) =>
              openDialog('create', null, trigger, status)
            }
            tasks={visibleTasks}
            today={today}
            movementRestricted={movementRestricted}
            projects={projectQuery.projects}
            onEdit={(task, trigger) => openDialog('edit', task, trigger)}
            onDelete={(task, trigger) => openDialog('delete', task, trigger)}
          />
        </Suspense>
      )
    if (taskQuery.tasks.length === 0)
      return (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          {t('tasks.empty')}
        </p>
      )
    if (visibleTasks.length === 0)
      return (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          {t('filters.empty')}
        </p>
      )
    return (
      <TaskList
        tasks={visibleTasks}
        today={today}
        projects={projectQuery.projects}
        onEdit={(task, trigger) => openDialog('edit', task, trigger)}
        onDelete={(task, trigger) => openDialog('delete', task, trigger)}
      />
    )
  }

  return (
    <section aria-labelledby={headingId} className="min-w-0 space-y-3">
      {project && (
        <ProjectWorkspaceHeader
          project={project}
          tasks={taskQuery.tasks}
          isPending={isLoading || isError}
        />
      )}
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <h2 id={headingId} className="sr-only">
          {t('tasks.title')}
        </h2>
        {projectId && (
          <div
            role="group"
            aria-label={t('kanban.view')}
            className="flex gap-2"
          >
            {['list', 'board'].map((option) => (
              <Button
                key={option}
                type="button"
                variant={view === option ? 'secondary' : 'outline'}
                className="min-h-11 min-w-11 gap-2 sm:min-h-9"
                aria-pressed={view === option}
                onClick={() => setView(option)}
              >
                {option === 'board' ? (
                  <Columns3 className="size-4" aria-hidden="true" />
                ) : (
                  <List className="size-4" aria-hidden="true" />
                )}
                <span className="sr-only min-[360px]:not-sr-only">
                  {t(`kanban.${option}`)}
                </span>
              </Button>
            ))}
          </div>
        )}
        <Button
          ref={createButtonRef}
          type="button"
          disabled={!canCreate}
          onClick={() => openDialog('create')}
          className="ml-auto min-h-11 gap-2 sm:min-h-9"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('tasks.actions.new')}
        </Button>
      </div>
      <TaskFilters
        filters={filters}
        onChange={(name, value) =>
          setFilters((previous) => ({ ...previous, [name]: value }))
        }
        onReset={() => setFilters(DEFAULT_TASK_FILTERS)}
        projects={projectQuery.projects}
        showProjects={!projectId}
        disabled={isLoading || isError}
        count={visibleTasks.length}
        total={taskQuery.tasks.length}
      />
      {renderTasks()}
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={handleOpenChange}
        task={activeDialog?.task}
        initialStatus={activeDialog?.initialStatus}
        projectId={projectId}
        projects={projectQuery.projects}
        onCloseAutoFocus={restoreFocus}
      />
      {activeDialog?.type === 'edit' && (
        <TaskDetailsPanel
          key={activeDialog.task.id}
          task={activeDialog.task}
          currentTask={taskQuery.tasks.find(
            (task) => task.id === activeDialog.task.id,
          )}
          isMissing={
            !isLoading &&
            !isError &&
            !taskQuery.tasks.some((task) => task.id === activeDialog.task.id)
          }
          projects={projectQuery.projects}
          onClose={() => setActiveDialog(null)}
          onCloseAutoFocus={restoreFocus}
        />
      )}
      <DeleteTaskDialog
        open={activeDialog?.type === 'delete'}
        onOpenChange={handleOpenChange}
        task={activeDialog?.task}
        onCloseAutoFocus={restoreFocus}
      />
    </section>
  )
}

export default TaskCollection
