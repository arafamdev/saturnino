import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Select as SelectPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'
import { inputClassName } from './input'

const emptyOption = '__saturnino_empty__'

function Select({
  ref,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  required,
  name,
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Root
      value={value ?? ''}
      onValueChange={(next) => onValueChange(next === emptyOption ? '' : next)}
      disabled={disabled}
      required={required}
      name={name}
    >
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          inputClassName,
          'flex items-center justify-between gap-2 text-left [&>span:first-child]:truncate',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          collisionPadding={12}
          onEscapeKeyDown={(event) => event.stopPropagation()}
          className="z-[70] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center">
            <ChevronUp className="size-4" aria-hidden="true" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {options.map(([option, label]) => (
              <SelectPrimitive.Item
                key={option}
                value={option || emptyOption}
                className="relative flex min-h-11 cursor-default items-center rounded-md py-2 pr-8 pl-3 text-sm outline-none focus:bg-accent data-[highlighted]:bg-accent sm:min-h-9"
              >
                <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2">
                  <Check className="size-4" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center">
            <ChevronDown className="size-4" aria-hidden="true" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export { Select }
