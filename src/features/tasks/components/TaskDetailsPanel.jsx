import { useRef, useState } from 'react'

import { ClipboardList, Trash2 } from 'lucide-react'
import { AlertDialog, Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FormDialogHeader } from '@/components/ui/form-dialog'

import { useTaskDraftGuard } from '../hooks/useTaskDraftGuard'
import { taskRepository } from '../services/taskRepository'

import DeleteTaskDialog from './DeleteTaskDialog'
import TaskForm from './TaskForm'

function TaskDetailsPanel({
  task,
  currentTask,
  isMissing,
  projects,
  onClose,
  onCloseAutoFocus,
}) {
  const { t, i18n } = useTranslation('app')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const deleteButtonRef = useRef(null)
  const lastPanelFocus = useRef(null)
  const guard = useTaskDraftGuard({ dirty, saving, onClose })
  const changed = currentTask && currentTask.updatedAt !== task.updatedAt
  const formatter = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  async function save(data) {
    setSaving(true)
    try {
      await taskRepository.updateTask(task.id, data, {
        expectedUpdatedAt: task.updatedAt,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog.Root
        open
        onOpenChange={(open) => {
          if (!open) guard.requestClose()
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content
            onCloseAutoFocus={onCloseAutoFocus}
            onFocusCapture={(event) => {
              lastPanelFocus.current = event.target
            }}
            className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col border-l bg-background shadow-xl sm:max-w-[600px]"
          >
            <FormDialogHeader
              icon={ClipboardList}
              title={t('tasks.dialog.editTitle')}
              description={t('taskDetails.description')}
              closeLabel={t('tasks.actions.close')}
              disabled={saving}
            />
            <div className="flex min-h-0 flex-1 flex-col">
              {(changed || isMissing) && (
                <p
                  role="status"
                  className="mx-5 mt-4 shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm sm:mx-6"
                >
                  {t(isMissing ? 'taskDetails.removed' : 'taskDetails.changed')}
                </p>
              )}
              <TaskForm
                task={task}
                projects={projects}
                onSubmit={save}
                onCancel={guard.requestClose}
                onDirtyChange={setDirty}
                stickyActions
              >
                <dl className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
                  {['createdAt', 'updatedAt', 'completedAt'].map(
                    (field) =>
                      task[field] && (
                        <div
                          key={field}
                          className="flex flex-wrap justify-between gap-2"
                        >
                          <dt>{t(`taskDetails.${field}`)}</dt>
                          <dd>
                            <time dateTime={task[field]}>
                              {formatter.format(new Date(task[field]))}
                            </time>
                          </dd>
                        </div>
                      ),
                  )}
                </dl>
                <Button
                  ref={deleteButtonRef}
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  className="mt-4 min-h-11 gap-2 text-destructive"
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {t('tasks.actions.delete')}
                </Button>
              </TaskForm>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <AlertDialog.Root
        open={guard.confirmExit}
        onOpenChange={(open) => {
          if (!open) guard.keepEditing()
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[80] bg-black/60" />
          <AlertDialog.Content
            onCloseAutoFocus={(event) => {
              if (lastPanelFocus.current?.isConnected) {
                event.preventDefault()
                lastPanelFocus.current.focus()
              }
            }}
            className="fixed top-1/2 left-1/2 z-[80] max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-background p-5 shadow-xl"
          >
            <AlertDialog.Title className="text-lg font-semibold">
              {t('taskDetails.discardTitle')}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              {t('taskDetails.discardDescription')}
            </AlertDialog.Description>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={guard.keepEditing}
                >
                  {t('taskDetails.keepEditing')}
                </Button>
              </AlertDialog.Cancel>
              <Button
                type="button"
                variant="destructive"
                className="min-h-11"
                disabled={saving}
                onClick={guard.discard}
              >
                {t('taskDetails.discard')}
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <DeleteTaskDialog
        open={deleting}
        onOpenChange={setDeleting}
        task={task}
        onDeleted={onClose}
        onCloseAutoFocus={(event) => {
          if (deleteButtonRef.current?.isConnected) {
            event.preventDefault()
            deleteButtonRef.current.focus()
          }
        }}
      />
    </>
  )
}

export default TaskDetailsPanel
