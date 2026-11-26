import { useState } from 'react'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { AlertDialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { projectRepository } from '../services/projectRepository'

function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onCloseAutoFocus,
}) {
  const { t } = useTranslation('app')
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasError, setHasError] = useState(false)

  function handleOpenChange(nextOpen) {
    if (isDeleting) return

    setHasError(false)
    onOpenChange(nextOpen)
  }

  async function handleDeleteProject() {
    if (!project || isDeleting) return

    setIsDeleting(true)
    setHasError(false)

    try {
      await projectRepository.deleteProject(project.id)

      onOpenChange(false)
    } catch {
      setHasError(true)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60" />

        <AlertDialog.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
        >
          <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Trash2 className="size-5" aria-hidden="true" />
          </div>

          <AlertDialog.Title className="text-lg font-semibold">
            {t('projects.deleteDialog.title')}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm leading-relaxed wrap-break-word text-muted-foreground">
            {t('projects.deleteDialog.description', {
              name: project?.name ?? '',
            })}
          </AlertDialog.Description>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />

            <p>{t('projects.deleteDialog.warning')}</p>
          </div>

          {hasError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {t('projects.errors.deleteFailed')}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                className="min-h-11 px-4"
              >
                {t('projects.actions.cancel')}
              </Button>
            </AlertDialog.Cancel>

            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteProject}
              className="min-h-11 px-4"
            >
              {isDeleting
                ? t('projects.actions.deleting')
                : t('projects.actions.delete')}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default DeleteProjectDialog
