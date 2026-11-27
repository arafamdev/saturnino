import { cn } from '@/lib/utils'
import { inputClassName } from './input'

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        inputClassName,
        'min-h-28 resize-y leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
