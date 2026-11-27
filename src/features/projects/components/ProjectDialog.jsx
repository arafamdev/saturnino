import { useState } from 'react'

import { FolderKanban } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import {
  FormDialogHeader,
  formDialogContentClassName,
} from '@/components/ui/form-dialog'

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
          className={formDialogContentClassName}
        >
          <FormDialogHeader
            icon={FolderKanban}
            title={t(
              isEditing
                ? 'projects.dialog.editTitle'
                : 'projects.dialog.createTitle',
            )}
            description={t(
              isEditing
                ? 'projects.dialog.editDescription'
                : 'projects.dialog.createDescription',
            )}
            closeLabel={t('projects.actions.close')}
            disabled={isSaving}
          />
          <ProjectForm
            key={project?.id ?? 'new-project'}
            project={project}
            scrollable
            onSubmit={handleSaveProject}
            onCancel={() => handleOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ProjectDialog
