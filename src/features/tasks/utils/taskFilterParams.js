import { TASK_PRIORITIES, TASK_STATUSES } from '../data/taskOptions'
import { DEFAULT_TASK_FILTERS } from './selectTasks'

const allowedValues = {
  status: ['all', ...TASK_STATUSES],
  priority: ['all', ...TASK_PRIORITIES],
  due: ['all', 'overdue', 'today', 'upcoming', 'none'],
  sort: ['manual', 'dueDate', 'priority', 'title', 'updated'],
}

export function readTaskFilterParams(params, projectId) {
  const filters = {
    ...DEFAULT_TASK_FILTERS,
    search: params.get('search') ?? '',
  }
  for (const [name, values] of Object.entries(allowedValues)) {
    const value = params.get(name)
    if (values.includes(value)) filters[name] = value
  }
  const requestedProject = params.get('projectId')
  // A project workspace must never be filtered by another project's URL value.
  if (
    !projectId &&
    requestedProject &&
    /^[\w-]{1,100}$/.test(requestedProject)
  ) {
    filters.projectId = requestedProject
  }
  return filters
}

export function writeTaskFilterParams(params, filters, projectId) {
  const next = new URLSearchParams(params)
  for (const [name, defaultValue] of Object.entries(DEFAULT_TASK_FILTERS)) {
    const value =
      name === 'projectId' && projectId ? defaultValue : filters[name]
    if (value && value !== defaultValue) next.set(name, value)
    else next.delete(name)
  }
  return next
}
