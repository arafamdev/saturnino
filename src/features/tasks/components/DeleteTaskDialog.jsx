import { useState } from 'react'

import { AlertDialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { taskRepository } from '../services/taskRepository'

function DeleteTaskDialog({
  open,
  onOpenChange,
  task,
  onCloseAutoFocus,
  onDeleted,
}) {
  const { t } = useTranslation('app')
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasError, setHasError] = useState(false)

  function handleOpenChange(nextOpen) {
    if (isDeleting) return
    setHasError(false)
    onOpenChange(nextOpen)
  }

  async function handleDelete() {
    if (!task || isDeleting) return
    setIsDeleting(true)
    setHasError(false)
    try {
      await taskRepository.deleteTask(task.id)
      onDeleted?.()
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
          <AlertDialog.Title className="text-lg font-semibold">
            {t('tasks.delete.title')}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm wrap-break-word text-muted-foreground">
            {t('tasks.delete.description', { title: task?.title ?? '' })}
          </AlertDialog.Description>
          {hasError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {t('tasks.errors.deleteFailed')}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                className="min-h-11"
              >
                {t('tasks.actions.cancel')}
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
              className="min-h-11"
            >
              {t(
                isDeleting ? 'tasks.actions.deleting' : 'tasks.actions.delete',
              )}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default DeleteTaskDialog
