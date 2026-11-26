import { useRef, useState } from 'react'

import { LoaderCircle, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import DeleteProjectDialog from '../components/DeleteProjectDialog'
import ProjectDialog from '../components/ProjectDialog'
import ProjectList from '../components/ProjectList'
import ProjectsEmptyState from '../components/ProjectsEmptyState'
import { useProjects } from '../hooks/useProjects'

function ProjectsPage() {
  const { t } = useTranslation('app')
  const { projects, isLoading } = useProjects()

  const newProjectButtonRef = useRef(null)

  const [activeDialog, setActiveDialog] = useState(null)

  function handleCreateProject() {
    setActiveDialog({
      type: 'create',
      project: null,
    })
  }

  function handleEditProject(project) {
    setActiveDialog({
      type: 'edit',
      project,
    })
  }

  function handleDeleteProject(project) {
    setActiveDialog({
      type: 'delete',
      project,
    })
  }

  function handleDialogOpenChange(open) {
    if (!open) {
      setActiveDialog(null)
    }
  }

  function handleRestoreFocus() {
    newProjectButtonRef.current?.focus()
  }

  const isProjectDialogOpen =
    activeDialog?.type === 'create' || activeDialog?.type === 'edit'

  const isDeleteDialogOpen = activeDialog?.type === 'delete'

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('projects.title')}
          </h1>

          <p className="text-sm text-muted-foreground">
            {t('projects.description')}
          </p>
        </div>

        <Button
          ref={newProjectButtonRef}
          type="button"
          onClick={handleCreateProject}
          className="min-h-11 px-4"
        >
          <Plus aria-hidden="true" />
          {t('projects.actions.new')}
        </Button>
      </div>

      {/* Projects content */}
      {isLoading ? (
        <div
          role="status"
          className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <LoaderCircle
            className="size-5 motion-safe:animate-spin"
            aria-hidden="true"
          />

          {t('projects.loading')}
        </div>
      ) : projects.length === 0 ? (
        <ProjectsEmptyState onCreate={handleCreateProject} />
      ) : (
        <ProjectList
          projects={projects}
          onCreate={handleCreateProject}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />
      )}

      {/* Project dialogs */}
      <div onFocusCapture={undefined}>
        <ProjectDialog
          open={isProjectDialogOpen}
          onOpenChange={handleDialogOpenChange}
          project={activeDialog?.project}
          onCloseAutoFocus={handleRestoreFocus}
        />

        <DeleteProjectDialog
          open={isDeleteDialogOpen}
          onOpenChange={handleDialogOpenChange}
          project={activeDialog?.project}
          onCloseAutoFocus={handleRestoreFocus}
        />
      </div>
    </section>
  )
}

export default ProjectsPage
