import { lazy, Suspense, useId, useState } from 'react'

import { CalendarDays, X } from 'lucide-react'
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
        if (next) setMonth(dateOnlyToLocalDate(value) ?? new Date())
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
          sideOffset={6}
          collisionPadding={4}
          onEscapeKeyDown={(event) => event.stopPropagation()}
          aria-label={t('datePicker.title')}
          className="z-[70] max-h-[var(--radix-popover-content-available-height)] w-[min(22.5rem,calc(100vw-0.5rem))] overflow-x-hidden overflow-y-auto [scrollbar-width:none] rounded-xl border bg-popover p-0 text-popover-foreground min-[360px]:p-3 shadow-xl outline-none"
        >
          <div className="sticky top-0 z-10 mb-2 flex items-center justify-between gap-2 bg-popover p-3 min-[360px]:p-0">
            <h3 className="text-sm font-medium">{t('datePicker.title')}</h3>
            <Popover.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={t('datePicker.close')}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </Popover.Close>
          </div>
          <Suspense
            fallback={
              <p role="status" className="p-4 text-sm">
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
          <div className="mx-3 mt-3 space-y-2 border-t pt-3 min-[360px]:mx-0">
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
            />
            <p
              id={`${manualId}-hint`}
              className="text-xs text-muted-foreground"
            >
              {t('datePicker.hint')}
            </p>
          </div>
          <div className="sticky bottom-0 z-10 mt-3 flex justify-between gap-2 bg-popover p-3 min-[360px]:p-0">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              {t('datePicker.clear')}
            </Button>
            <Popover.Close asChild>
              <Button type="button" variant="outline" className="min-h-11">
                {t('datePicker.done')}
              </Button>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export { DatePicker }
