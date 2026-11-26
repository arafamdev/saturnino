import { cn } from '@/lib/utils'
import { inputClassName } from './input'

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(inputClassName, 'min-h-24 resize-y', className)}
      {...props}
    />
  )
}

export { Textarea }
