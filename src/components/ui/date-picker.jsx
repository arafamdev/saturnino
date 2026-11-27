import { lazy, Suspense, useId, useState } from 'react'

import { CalendarDays, Keyboard, X } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import {
  dateOnlyToLocalDate,
  formatDateOnly,
  isValidDateOnly,
  localDateToDateOnly,
} from '@/lib/dates/dateOnly'
import { cn } from '@/lib/utils'

import { Button } from './button'
import { Input, inputClassName } from './input'

import './date-picker.css'

const Calendar = lazy(() => import('./calendar'))

function DatePicker({
  ref,
  value,
  onChange,
  onBlur,
  disabled,
  className,
  ...props
}) {
  const { t, i18n } = useTranslation('app')
  const manualId = useId()
  const [open, setOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [month, setMonth] = useState(
    () => dateOnlyToLocalDate(value) ?? new Date(),
  )
  const selected = dateOnlyToLocalDate(value)
  const label = isValidDateOnly(value)
    ? formatDateOnly(value, i18n.resolvedLanguage)
    : value || t('datePicker.placeholder')
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setMonth(dateOnlyToLocalDate(value) ?? new Date())
          setManualOpen(Boolean(value && !isValidDateOnly(value)))
        }
        setOpen(next)
      }}
    >
      <Popover.Trigger asChild>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            inputClassName,
            'flex items-center justify-between gap-2 text-left',
            !value && 'text-muted-foreground',
            className,
          )}
          {...props}
        >
          <span>{label}</span>
          <CalendarDays
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          side="top"
          sideOffset={6}
          collisionPadding={8}
          onEscapeKeyDown={(event) => event.stopPropagation()}
          aria-label={t('datePicker.title')}
          className="saturnino-date-popover z-[70] max-h-[var(--radix-popover-content-available-height)] overflow-x-hidden overflow-y-auto [scrollbar-width:none] rounded-xl border bg-popover p-3 text-popover-foreground shadow-xl outline-none"
        >
          <Suspense
            fallback={
              <p
                role="status"
                className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"
              >
                {t('datePicker.loading')}
              </p>
            }
          >
            <Calendar
              month={month}
              onMonthChange={setMonth}
              locale={i18n.resolvedLanguage}
              selected={selected}
              onSelect={(date) => {
                onChange(date ? localDateToDateOnly(date) : '')
                setOpen(false)
              }}
            />
          </Suspense>
          {manualOpen && (
            <div
              id={`${manualId}-entry`}
              className="mt-3 space-y-2 border-t pt-3"
            >
              <label htmlFor={manualId} className="text-xs font-medium">
                {t('datePicker.manual')}
              </label>
              <Input
                id={manualId}
                value={value ?? ''}
                onChange={(event) => {
                  const next = event.target.value
                  onChange(next)
                  const date = dateOnlyToLocalDate(next)
                  if (date) setMonth(date)
                }}
                placeholder="YYYY-MM-DD"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(value && !isValidDateOnly(value))}
                aria-describedby={`${manualId}-hint`}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    if (!value || isValidDateOnly(value)) setOpen(false)
                  }
                }}
              />
              <p id={`${manualId}-hint`} className="sr-only">
                {t('datePicker.hint')}
              </p>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between gap-1 border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              className="min-h-10 gap-2 px-2 text-xs"
              aria-expanded={manualOpen}
              aria-controls={`${manualId}-entry`}
              onClick={() => setManualOpen((current) => !current)}
            >
              <Keyboard className="size-4" aria-hidden="true" />
              {t('datePicker.typeDate')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-10 px-2 text-xs"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              {t('datePicker.clear')}
            </Button>
            <Popover.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                aria-label={t('datePicker.close')}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export { DatePicker }
