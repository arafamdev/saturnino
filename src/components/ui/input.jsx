import { cn } from '@/lib/utils'

export const inputClassName =
  'min-h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2.5 text-sm leading-5 shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 hover:border-muted-foreground/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50'

function Input({ className, ...props }) {
  return <input className={cn(inputClassName, className)} {...props} />
}

export { Input }
