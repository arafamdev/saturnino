import { useState } from 'react'

import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { taskRepository } from '../services/taskRepository'

import TaskForm from './TaskForm'

function TaskDialog({
  open,
  onOpenChange,
  task,
  projectId,
  initialStatus,
  projects,
  onCloseAutoFocus,
}) {
  const { t } = useTranslation('app')
  const [isSaving, setIsSaving] = useState(false)

  function handleOpenChange(nextOpen) {
    if (!isSaving) onOpenChange(nextOpen)
  }

  async function handleSave(data) {
    setIsSaving(true)
    try {
      if (task) await taskRepository.updateTask(task.id, data)
      else await taskRepository.createTask(data)
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
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold">
                {t(
                  task ? 'tasks.dialog.editTitle' : 'tasks.dialog.createTitle',
                )}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {t('tasks.dialog.description')}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isSaving}
                aria-label={t('tasks.actions.close')}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <TaskForm
            key={task?.id ?? `new-task-${initialStatus ?? 'todo'}`}
            task={task}
            initialStatus={initialStatus}
            projectId={projectId}
            projects={projects}
            onSubmit={handleSave}
            onCancel={() => handleOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default TaskDialog
