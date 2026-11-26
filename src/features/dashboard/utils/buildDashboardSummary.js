import { TASK_STATUSES } from '@/features/tasks/data/taskOptions'
import { isTaskOverdue } from '@/features/tasks/utils/selectTasks'

export function buildDashboardSummary({ projects, tasks }, today) {
  const statusCounts = Object.fromEntries(
    TASK_STATUSES.map((status) => [status, 0]),
  )
  const projectsById = new Map(
    projects.map((project) => [
      project.id,
      { ...project, taskCount: 0, completedCount: 0 },
    ]),
  )
  let completed = 0
  let overdue = 0
  const upcoming = []
  for (const task of tasks) {
    if (Object.hasOwn(statusCounts, task.status)) statusCounts[task.status] += 1
    const project = projectsById.get(task.projectId)
    if (project) {
      project.taskCount += 1
      if (task.status === 'done') project.completedCount += 1
    }
    if (task.status === 'done') completed += 1
    if (isTaskOverdue(task, today)) overdue += 1
    if (task.status !== 'done' && task.dueDate && task.dueDate >= today)
      upcoming.push(task)
  }
  upcoming.sort(
    (a, b) => a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id),
  )
  const projectProgress = Array.from(projectsById.values())
    .map((project) => ({
      ...project,
      progress: project.taskCount
        ? Math.round((project.completedCount / project.taskCount) * 100)
        : 0,
    }))
    .sort(
      (a, b) =>
        b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id),
    )
  return {
    projectCount: projects.length,
    taskCount: tasks.length,
    completed,
    open: tasks.length - completed,
    overdue,
    completionRate: tasks.length
      ? Math.round((completed / tasks.length) * 100)
      : 0,
    statusCounts,
    projectProgress,
    upcoming: upcoming.slice(0, 5),
  }
}
