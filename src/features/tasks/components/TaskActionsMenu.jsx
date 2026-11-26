import { useRef } from 'react'

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export const taskMenuItemClass =
  'flex min-h-11 cursor-default items-center gap-2 rounded px-2 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-40 md:min-h-9'

function TaskActionsMenu({ task, onEdit, onDelete, children, busy }) {
  const { t } = useTranslation('app')
  const triggerRef = useRef(null)
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 md:size-8"
          disabled={busy}
          aria-label={t('taskCard.actions', { title: task.title })}
          data-task-focus="menu"
          data-task-id={task.id}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-48 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          <DropdownMenu.Item
            className={taskMenuItemClass}
            onSelect={() => onEdit(task, triggerRef.current)}
          >
            <Pencil className="size-4" aria-hidden="true" />
            {t('tasks.actions.editNamed', { title: task.title })}
          </DropdownMenu.Item>
          {children}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={`${taskMenuItemClass} text-destructive`}
            onSelect={() => onDelete(task, triggerRef.current)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('tasks.actions.deleteNamed', { title: task.title })}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default TaskActionsMenu
