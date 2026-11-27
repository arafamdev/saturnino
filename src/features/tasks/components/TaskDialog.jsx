import { useState } from 'react'

import { ClipboardList } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import {
  FormDialogHeader,
  formDialogContentClassName,
} from '@/components/ui/form-dialog'

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
          className={formDialogContentClassName}
        >
          <FormDialogHeader
            icon={ClipboardList}
            title={t(
              task ? 'tasks.dialog.editTitle' : 'tasks.dialog.createTitle',
            )}
            description={t('tasks.dialog.description')}
            closeLabel={t('tasks.actions.close')}
            disabled={isSaving}
          />
          <TaskForm
            key={task?.id ?? `new-task-${initialStatus ?? 'todo'}`}
            task={task}
            stickyActions
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
