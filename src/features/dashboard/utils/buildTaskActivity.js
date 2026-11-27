import { dateOnlyToLocalDate, localDateToDateOnly } from '@/lib/dates/dateOnly'

export function timestampDateOnly(value) {
  if (!value) return ''
  return localDateToDateOnly(new Date(value))
}

export function buildTaskActivity(tasks, today) {
  const end = dateOnlyToLocalDate(today)
  if (!end) return { days: [], hasComparison: false }
  const days = []
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date(end)
    date.setDate(date.getDate() - offset)
    const key = localDateToDateOnly(date)
    if (key) days.push({ date: key, created: 0, completed: 0 })
  }
  const byDate = new Map(days.map((day) => [day.date, day]))
  for (const task of tasks) {
    const created = byDate.get(timestampDateOnly(task.createdAt))
    if (created) created.created += 1
    // Reopened tasks no longer retain a completed event in this data model.
    const completed =
      task.status === 'done'
        ? byDate.get(timestampDateOnly(task.completedAt))
        : null
    if (completed) completed.completed += 1
  }
  return {
    days,
    hasComparison:
      days.filter((day) => day.created || day.completed).length >= 2,
  }
}
