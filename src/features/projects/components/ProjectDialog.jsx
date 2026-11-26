import { useState } from 'react'

import { FolderKanban, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { projectRepository } from '../services/projectRepository'
import ProjectForm from './ProjectForm'

function ProjectDialog({
  open,
  onOpenChange,
  project = null,
  onCloseAutoFocus,
}) {
  const { t } = useTranslation('app')
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = Boolean(project)

  function handleOpenChange(nextOpen) {
    if (!isSaving) {
      onOpenChange(nextOpen)
    }
  }

  async function handleSaveProject(projectData) {
    setIsSaving(true)

    try {
      if (isEditing) {
        await projectRepository.updateProject(project.id, projectData)
      } else {
        await projectRepository.createProject(projectData)
      }

      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />

        <Dialog.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-background p-5 shadow-xl sm:p-6"
        >
          {/* Dialog header */}
          <div className="mb-6 flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="size-5" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <Dialog.Title className="text-lg font-semibold">
                {t(
                  isEditing
                    ? 'projects.dialog.editTitle'
                    : 'projects.dialog.createTitle',
                )}
              </Dialog.Title>

              <Dialog.Description className="text-sm text-muted-foreground">
                {t(
                  isEditing
                    ? 'projects.dialog.editDescription'
                    : 'projects.dialog.createDescription',
                )}
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isSaving}
                aria-label={t('projects.actions.close')}
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Shared create and edit form */}
          <ProjectForm
            key={project?.id ?? 'new-project'}
            project={project}
            onSubmit={handleSaveProject}
            onCancel={() => handleOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ProjectDialog
