import { useRef } from 'react'

import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function ProjectActionsMenu({ project, onEdit, onDelete, className }) {
  const triggerRef = useRef(null)
  const { t } = useTranslation('app')

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-10 shrink-0', className)}
          aria-label={t('projects.actions.menu', {
            name: project.name,
          })}
        >
          <Ellipsis className="size-5" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-44 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          <DropdownMenu.Item
            onSelect={() => onEdit(project, triggerRef.current)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
          >
            <Pencil className="size-4" aria-hidden="true" />
            {t('projects.actions.edit')}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            onSelect={() => onDelete(project, triggerRef.current)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none focus:bg-destructive/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('projects.actions.delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ProjectActionsMenu
