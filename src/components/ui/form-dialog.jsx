import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { Button } from './button'

// Only the form body scrolls, including when nested controls move focus.
export const formDialogContentClassName =
  'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-clip rounded-2xl border bg-background shadow-xl'

function FormDialogHeader({
  icon: Icon,
  title,
  description,
  closeLabel,
  disabled,
}) {
  return (
    <header className="flex shrink-0 items-start gap-3 border-b px-5 py-5 sm:px-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <Dialog.Title className="text-lg leading-6 font-semibold tracking-tight">
          {title}
        </Dialog.Title>
        <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </Dialog.Description>
      </div>
      <Dialog.Close asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          disabled={disabled}
          aria-label={closeLabel}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </Dialog.Close>
    </header>
  )
}

export { FormDialogHeader }
