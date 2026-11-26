import { useRef, useState } from 'react'

import { Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import DeleteProjectDialog from '@/features/projects/components/DeleteProjectDialog'
import ProjectDialog from '@/features/projects/components/ProjectDialog'
import { useSidebarProjects } from '../hooks/useSidebarProjects'

import { sidebarSectionIds } from '../state/sidebarReducer'

import SidebarProjectList from './SidebarProjectList'
import SidebarSection from './SidebarSection'

function SidebarProjectExplorer({ onNavigate }) {
  const { t, i18n } = useTranslation('app')

  const { projects, isLoading, isError, retry } = useSidebarProjects()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeDialog, setActiveDialog] = useState(null)

  const actionTriggerRef = useRef(null)
  const newProjectButtonRef = useRef(null)

  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()

  const projectNameCollator = new Intl.Collator(i18n.resolvedLanguage, {
    sensitivity: 'base',
    numeric: true,
  })

  const visibleProjects = projects
    .filter((project) =>
      project.name.toLocaleLowerCase().includes(normalizedSearchQuery),
    )
    .sort((firstProject, secondProject) =>
      projectNameCollator.compare(firstProject.name, secondProject.name),
    )

  const isProjectDialogOpen =
    activeDialog?.type === 'create' || activeDialog?.type === 'edit'

  const isDeleteDialogOpen = activeDialog?.type === 'delete'

  function handleCreateProject() {
    actionTriggerRef.current = null
    setActiveDialog({
      type: 'create',
      project: null,
    })
  }

  function handleEditProject(project, trigger) {
    actionTriggerRef.current = trigger
    setActiveDialog({
      type: 'edit',
      project,
    })
  }

  function handleDeleteProject(project, trigger) {
    actionTriggerRef.current = trigger
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

  function handleRestoreFocus(event) {
    const newProjectButton = actionTriggerRef.current?.isConnected
      ? actionTriggerRef.current
      : newProjectButtonRef.current

    if (newProjectButton && !newProjectButton.disabled) {
      event.preventDefault()
      newProjectButton.focus()
    }
  }

  return (
    <>
      <SidebarSection
        sectionId={sidebarSectionIds.PROJECT_EXPLORER}
        title={t('projectExplorer.title')}
      >
        {/* Project search */}
        <div className="relative mb-2">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label={t('projectExplorer.search')}
            placeholder={t('projectExplorer.search')}
            disabled={isLoading || isError}
            className="min-h-11 w-full min-w-0 rounded-lg border bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
          />
        </div>

        {/* Create project */}
        <Button
          ref={newProjectButtonRef}
          type="button"
          variant="ghost"
          onClick={handleCreateProject}
          disabled={isLoading || isError}
          className="mb-1 min-h-11 w-full justify-start gap-3 px-3 text-muted-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('projectExplorer.newProject')}
        </Button>

        {/* Project results */}
        <SidebarProjectList
          projects={visibleProjects}
          label={t('projectExplorer.title')}
          emptyMessage={t(
            normalizedSearchQuery
              ? 'projectExplorer.noResults'
              : 'projectExplorer.empty',
          )}
          loadingMessage={t('projectExplorer.loading')}
          errorMessage={t('projectExplorer.loadError')}
          isLoading={isLoading}
          isError={isError}
          retry={retry}
          onNavigate={onNavigate}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />
      </SidebarSection>

      {/* Shared project dialogs */}
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
    </>
  )
}

export default SidebarProjectExplorer
