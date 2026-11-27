import { useRef, useState } from 'react'

import { ChevronDown, FolderKanban } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

import DeleteProjectDialog from './DeleteProjectDialog'
import ProjectActionsMenu from './ProjectActionsMenu'
import ProjectDialog from './ProjectDialog'
import ProjectFavoriteButton from './ProjectFavoriteButton'

function ProjectWorkspaceHeader({ project, tasks, isPending }) {
  const { t } = useTranslation('app')
  const navigate = useNavigate()
  const triggerRef = useRef(null)
  const headingRef = useRef(null)
  const [dialog, setDialog] = useState(null)
  const [nameExpanded, setNameExpanded] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const completed = tasks.filter((task) => task.status === 'done').length
  const percentage = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0

  function openDialog(type, trigger) {
    triggerRef.current = trigger
    setDialog(type)
  }

  function restoreFocus(event) {
    const target = triggerRef.current?.isConnected
      ? triggerRef.current
      : headingRef.current
    if (target) {
      event.preventDefault()
      target.focus()
    }
  }

  return (
    <header className="space-y-2">
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${project.color}20` }}
        >
          <FolderKanban
            className="size-5"
            style={{ color: project.color }}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 self-center">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-xl leading-tight font-semibold tracking-tight wrap-break-word outline-none sm:text-2xl"
          >
            {project.name.length > 40 ? (
              <button
                type="button"
                className="flex min-h-11 w-full items-start gap-1 rounded text-left focus-visible:ring-2 focus-visible:ring-ring"
                aria-expanded={nameExpanded}
                aria-description={t(
                  nameExpanded
                    ? 'projectWorkspace.collapseName'
                    : 'projectWorkspace.expandName',
                )}
                title={project.name}
                onClick={() => setNameExpanded((value) => !value)}
              >
                <span
                  className={`min-w-0 flex-1 ${nameExpanded ? '' : 'line-clamp-2'}`}
                >
                  {project.name}
                </span>
                <ChevronDown
                  className={`mt-1 size-3 shrink-0 ${nameExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            ) : (
              project.name
            )}
          </h1>
        </div>
        <div className="flex shrink-0 items-center">
          <ProjectFavoriteButton project={project} />
          <ProjectActionsMenu
            project={project}
            onEdit={(_, trigger) => openDialog('edit', trigger)}
            onDelete={(_, trigger) => openDialog('delete', trigger)}
          />
        </div>
        {project.description && (
          <div className="col-span-3 min-w-0 max-w-3xl text-sm text-muted-foreground sm:col-span-2 sm:col-start-2">
            <p
              className={`${descriptionExpanded || project.description.length <= 120 ? '' : 'line-clamp-2'} leading-relaxed whitespace-pre-wrap wrap-break-word`}
            >
              {project.description}
            </p>
            {project.description.length > 120 && (
              <Button
                type="button"
                variant="link"
                className="mt-1 min-h-11 p-0 text-xs sm:min-h-9"
                aria-expanded={descriptionExpanded}
                onClick={() => setDescriptionExpanded((value) => !value)}
              >
                {t(
                  descriptionExpanded
                    ? 'projectWorkspace.less'
                    : 'projectWorkspace.more',
                )}
              </Button>
            )}
          </div>
        )}
      </div>
      <div
        className="ml-auto flex max-w-sm items-center gap-3 text-xs text-muted-foreground"
        aria-busy={isPending}
      >
        <span className="shrink-0">
          {isPending
            ? t('tasks.loading')
            : t('projectWorkspace.progress', {
                completed,
                total: tasks.length,
              })}
        </span>
        <progress
          aria-label={t('projectWorkspace.progressLabel')}
          max={100}
          value={isPending ? undefined : percentage}
          className="h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-muted accent-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary"
        />
        {!isPending && <span className="tabular-nums">{percentage}%</span>}
      </div>
      <ProjectDialog
        open={dialog === 'edit'}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
        project={project}
        onCloseAutoFocus={restoreFocus}
      />
      <DeleteProjectDialog
        open={dialog === 'delete'}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
        project={project}
        onCloseAutoFocus={restoreFocus}
        onDeleted={() => navigate('/app/projects')}
      />
    </header>
  )
}

export default ProjectWorkspaceHeader
