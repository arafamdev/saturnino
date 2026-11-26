import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { TASK_PRIORITIES, TASK_STATUSES } from '../data/taskOptions'

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
  const controlClass =
    'mt-1 min-h-11 w-full rounded-md border bg-background px-3 text-sm text-foreground disabled:opacity-50'
  function select(name, options) {
    return (
      <label className="min-w-0 text-sm" htmlFor={`${id}-${name}`}>
        {t(`filters.${name}`)}
        <select
          id={`${id}-${name}`}
          className={controlClass}
          value={filters[name]}
          onChange={(event) => onChange(name, event.target.value)}
        >
          {options.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    )
  }
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <fieldset
        disabled={disabled}
        className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        <legend className="sr-only">{t('filters.title')}</legend>
        <label htmlFor={`${id}-search`} className="min-w-0 text-sm">
          {t('filters.search')}
          <input
            id={`${id}-search`}
            type="search"
            className={controlClass}
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder={t('filters.placeholder')}
          />
        </label>
        {select('status', [
          ['all', t('filters.allStatuses')],
          ...TASK_STATUSES.map((value) => [value, t(`tasks.status.${value}`)]),
        ])}
        {select('priority', [
          ['all', t('filters.allPriorities')],
          ...TASK_PRIORITIES.map((value) => [
            value,
            t(`tasks.priority.${value}`),
          ]),
        ])}
        {showProjects &&
          select('projectId', [
            ['all', t('filters.allProjects')],
            ...projects
              .toSorted((a, b) =>
                a.name.localeCompare(b.name, i18n.resolvedLanguage, {
                  numeric: true,
                  sensitivity: 'base',
                }),
              )
              .map((project) => [project.id, project.name]),
          ])}
        {select(
          'due',
          ['all', 'overdue', 'today', 'upcoming', 'none'].map((value) => [
            value,
            t(`filters.dueOptions.${value}`),
          ]),
        )}
        {select(
          'sort',
          ['manual', 'dueDate', 'priority', 'title', 'updated'].map((value) => [
            value,
            t(`filters.sortOptions.${value}`),
          ]),
        )}
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          aria-label={t('filters.results')}
          className="text-sm text-muted-foreground"
        >
          {disabled ? '—' : t('filters.count', { count, total })}
        </p>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={disabled}
          onClick={onReset}
        >
          {t('filters.clear')}
        </Button>
      </div>
    </div>
  )
}
export default TaskFilters
