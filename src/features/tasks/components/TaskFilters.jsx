import { useId } from 'react'

import { ArrowUpDown, Check, Search, SlidersHorizontal, X } from 'lucide-react'
import { DropdownMenu, Popover } from 'radix-ui'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

import { TASK_PRIORITIES, TASK_STATUSES } from '../data/taskOptions'

const sortOptions = ['manual', 'dueDate', 'priority', 'title', 'updated']

function TaskFilters({
  filters,
  onChange,
  onReset,
  projects,
  showProjects,
  disabled,
  count,
  total,
}) {
  const { t, i18n } = useTranslation('app')
  const id = useId()
  const criteria = [
    {
      name: 'status',
      options: [
        ['all', t('filters.allStatuses')],
        ...TASK_STATUSES.map((value) => [value, t(`tasks.status.${value}`)]),
      ],
    },
    {
      name: 'priority',
      options: [
        ['all', t('filters.allPriorities')],
        ...TASK_PRIORITIES.map((value) => [
          value,
          t(`tasks.priority.${value}`),
        ]),
      ],
    },
    ...(showProjects
      ? [
          {
            name: 'projectId',
            options: [
              ['all', t('filters.allProjects')],
              ...projects
                .toSorted((a, b) =>
                  a.name.localeCompare(b.name, i18n.resolvedLanguage, {
                    numeric: true,
                    sensitivity: 'base',
                  }),
                )
                .map((project) => [project.id, project.name]),
            ],
          },
        ]
      : []),
    {
      name: 'due',
      options: ['all', 'overdue', 'today', 'upcoming', 'none'].map((value) => [
        value,
        t(`filters.dueOptions.${value}`),
      ]),
    },
  ]
  const activeCriteria = criteria.filter(({ name }) => filters[name] !== 'all')
  const hasChanges =
    activeCriteria.length > 0 ||
    Boolean(filters.search) ||
    filters.sort !== 'manual'

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <label className="sr-only" htmlFor={`${id}-search`}>
            {t('filters.search')}
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={`${id}-search`}
            type="search"
            disabled={disabled}
            className="min-h-11 w-full min-w-0 rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:min-h-9"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder={t('filters.placeholder')}
          />
        </div>
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={t('taskToolbar.filters')}
              className="min-h-11 gap-2 px-3 sm:min-h-9"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">
                {t('taskToolbar.filters')}
              </span>
              {activeCriteria.length > 0 && (
                <span className="rounded bg-primary/10 px-1.5 text-xs tabular-nums text-primary">
                  {activeCriteria.length}
                </span>
              )}
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={8}
              aria-label={t('taskToolbar.filters')}
              className="z-50 max-h-[var(--radix-popover-content-available-height)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">
                  {t('taskToolbar.filters')}
                </h3>
                <Popover.Close asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={t('taskToolbar.closeFilters')}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </Popover.Close>
              </div>
              <fieldset disabled={disabled} className="space-y-4">
                <legend className="sr-only">{t('filters.title')}</legend>
                {criteria.map(({ name, options }) => (
                  <Field
                    key={name}
                    id={`${id}-${name}`}
                    label={t(`filters.${name}`)}
                  >
                    <Select
                      id={`${id}-${name}`}
                      value={filters[name]}
                      onValueChange={(value) => onChange(name, value)}
                      options={options}
                      disabled={disabled}
                      className="sm:min-h-9"
                    />
                  </Field>
                ))}
              </fieldset>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={t('filters.sort')}
              className="min-h-11 gap-2 px-3 sm:min-h-9"
            >
              <ArrowUpDown className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">
                {t(`filters.sortOptions.${filters.sort}`)}
              </span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-56 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
            >
              <DropdownMenu.Label className="px-3 py-2 text-xs font-medium text-muted-foreground">
                {t('filters.sort')}
              </DropdownMenu.Label>
              <DropdownMenu.RadioGroup
                value={filters.sort}
                onValueChange={(value) => onChange('sort', value)}
              >
                {sortOptions.map((value) => (
                  <DropdownMenu.RadioItem
                    key={value}
                    value={value}
                    className="relative flex min-h-11 cursor-pointer items-center rounded-md py-2 pr-3 pl-9 text-sm outline-none focus:bg-accent sm:min-h-9"
                  >
                    <DropdownMenu.ItemIndicator className="absolute left-3">
                      <Check className="size-4" aria-hidden="true" />
                    </DropdownMenu.ItemIndicator>
                    {t(`filters.sortOptions.${value}`)}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <p
          role="status"
          aria-label={t('filters.results')}
          className="sr-only text-xs tabular-nums text-muted-foreground md:not-sr-only"
        >
          {disabled ? '—' : t('filters.count', { count, total })}
        </p>
      </div>
      {(hasChanges || total > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <p
            aria-hidden="true"
            className="mr-auto text-xs tabular-nums text-muted-foreground md:hidden"
          >
            {disabled ? '—' : t('filters.count', { count, total })}
          </p>
          {activeCriteria.map(({ name, options }) => {
            const valueLabel =
              options.find(([value]) => value === filters[name])?.[1] ??
              filters[name]
            const label = `${t(`filters.${name}`)}: ${valueLabel}`
            return (
              <Button
                key={name}
                type="button"
                variant="secondary"
                className="min-h-9 max-w-full gap-1.5 text-xs"
                aria-label={t('taskToolbar.removeFilter', { label })}
                onClick={() => onChange(name, 'all')}
              >
                <span className="truncate">{valueLabel}</span>
                <X className="size-3" aria-hidden="true" />
              </Button>
            )
          })}
          {hasChanges && (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className="min-h-9 px-2 text-xs text-muted-foreground"
              onClick={onReset}
            >
              {t('filters.clear')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskFilters
