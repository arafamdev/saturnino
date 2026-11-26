import { TASK_PRIORITIES } from '../data/taskOptions'

export const DEFAULT_TASK_FILTERS = {
  search: '',
  status: 'all',
  priority: 'all',
  projectId: 'all',
  due: 'all',
  sort: 'manual',
}

function normalizeSearch(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim()
}

export function hasTaskFilters(filters) {
  return Boolean(
    filters.search.trim() ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.projectId !== 'all' ||
    filters.due !== 'all',
  )
}

export function isTaskOverdue(task, today) {
  return task.status !== 'done' && Boolean(task.dueDate && task.dueDate < today)
}

export function selectTasks(tasks, filters, { today, locale = 'en' }) {
  const query = normalizeSearch(filters.search)
  const result = tasks.filter((task) => {
    if (
      query &&
      !normalizeSearch(`${task.title} ${task.description}`).includes(query)
    )
      return false
    if (filters.status !== 'all' && task.status !== filters.status) return false
    if (filters.priority !== 'all' && task.priority !== filters.priority)
      return false
    if (filters.projectId !== 'all' && task.projectId !== filters.projectId)
      return false
    if (filters.due === 'overdue' && !isTaskOverdue(task, today)) return false
    if (filters.due === 'today' && task.dueDate !== today) return false
    if (filters.due === 'upcoming' && !(task.dueDate && task.dueDate > today))
      return false
    if (filters.due === 'none' && task.dueDate) return false
    return true
  })
  const collator = new Intl.Collator(locale, {
    numeric: true,
    sensitivity: 'base',
  })
  const compare = {
    title: (a, b) => collator.compare(a.title, b.title),
    priority: (a, b) =>
      TASK_PRIORITIES.indexOf(b.priority) - TASK_PRIORITIES.indexOf(a.priority),
    dueDate: (a, b) =>
      (a.dueDate ?? '9999-99-99').localeCompare(b.dueDate ?? '9999-99-99'),
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  }[filters.sort]
  if (compare)
    result.sort(
      (a, b) =>
        compare(a, b) || a.position - b.position || a.id.localeCompare(b.id),
    )
  return result
}
