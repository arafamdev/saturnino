import { database } from '@/lib/db/database'
import { isValidDateOnly } from '@/lib/dates/dateOnly'

import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TITLE_MAX_LENGTH,
} from '../data/taskOptions'

export function normalizeTaskData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('TASK_DATA_INVALID')
  }
  const {
    projectId,
    title,
    description = '',
    status = DEFAULT_TASK_STATUS,
    priority = DEFAULT_TASK_PRIORITY,
    dueDate = null,
  } = data
  if (typeof projectId !== 'string' || !projectId.trim())
    throw new Error('TASK_PROJECT_REQUIRED')
  if (typeof title !== 'string' || !title.trim())
    throw new Error('TASK_TITLE_REQUIRED')
  if (title.trim().length > TASK_TITLE_MAX_LENGTH)
    throw new Error('TASK_TITLE_TOO_LONG')
  if (
    typeof description !== 'string' ||
    description.trim().length > TASK_DESCRIPTION_MAX_LENGTH
  )
    throw new Error('TASK_DESCRIPTION_INVALID')
  if (!TASK_STATUSES.includes(status)) throw new Error('TASK_STATUS_INVALID')
  if (!TASK_PRIORITIES.includes(priority))
    throw new Error('TASK_PRIORITY_INVALID')
  const normalizedDueDate = dueDate === '' ? null : dueDate
  if (normalizedDueDate !== null && !isValidDateOnly(normalizedDueDate))
    throw new Error('TASK_DUE_DATE_INVALID')

  return {
    projectId: projectId.trim(),
    title: title.trim(),
    description: description.trim(),
    status,
    priority,
    dueDate: normalizedDueDate,
  }
}

export function createTaskRepository(db = database) {
  async function getTasks(projectId) {
    const tasks =
      projectId === undefined
        ? await db.tasks.toArray()
        : await db.tasks.where('projectId').equals(projectId).toArray()
    return tasks.sort(
      (first, second) =>
        (first.position ?? 0) - (second.position ?? 0) ||
        first.id.localeCompare(second.id),
    )
  }

  async function getTaskById(taskId) {
    return db.tasks.get(taskId)
  }

  async function getNextPosition(projectId, status) {
    const tasks = await db.tasks.where('projectId').equals(projectId).toArray()
    const position =
      tasks
        .filter((task) => task.status === status)
        .reduce(
          (maximum, task) =>
            Number.isSafeInteger(task.position)
              ? Math.max(maximum, task.position)
              : maximum,
          -1,
        ) + 1
    if (!Number.isSafeInteger(position))
      throw new Error('TASK_POSITION_INVALID')
    return position
  }

  async function assertProjectExists(projectId) {
    if (!(await db.projects.get(projectId)))
      throw new Error('TASK_PROJECT_NOT_FOUND')
  }

  async function createTask(data) {
    const normalizedData = normalizeTaskData(data)
    return db.transaction('rw', db.projects, db.tasks, async () => {
      await assertProjectExists(normalizedData.projectId)
      const timestamp = new Date().toISOString()
      const task = {
        id: crypto.randomUUID(),
        ...normalizedData,
        position: await getNextPosition(
          normalizedData.projectId,
          normalizedData.status,
        ),
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: normalizedData.status === 'done' ? timestamp : null,
      }
      await db.tasks.add(task)
      return task
    })
  }

  async function updateTask(taskId, data) {
    const normalizedData = normalizeTaskData(data)
    return db.transaction('rw', db.projects, db.tasks, async () => {
      const existingTask = await db.tasks.get(taskId)
      if (!existingTask) throw new Error('TASK_NOT_FOUND')
      await assertProjectExists(normalizedData.projectId)
      const timestamp = new Date().toISOString()
      const hasMoved =
        existingTask.projectId !== normalizedData.projectId ||
        existingTask.status !== normalizedData.status
      const task = {
        ...existingTask,
        ...normalizedData,
        position: hasMoved
          ? await getNextPosition(
              normalizedData.projectId,
              normalizedData.status,
            )
          : existingTask.position,
        updatedAt: timestamp,
        completedAt:
          normalizedData.status === 'done'
            ? (existingTask.completedAt ?? timestamp)
            : null,
      }
      await db.tasks.put(task)
      return task
    })
  }

  async function deleteTask(taskId) {
    return db.transaction('rw', db.tasks, async () => {
      if (!(await db.tasks.get(taskId))) throw new Error('TASK_NOT_FOUND')
      await db.tasks.delete(taskId)
    })
  }

  async function moveTask(taskId, movement) {
    if (!movement || typeof movement !== 'object' || Array.isArray(movement))
      throw new Error('TASK_MOVE_INVALID')
    const { projectId, status, index, expectedUpdatedAt } = movement
    if (typeof projectId !== 'string' || !projectId.trim())
      throw new Error('TASK_PROJECT_REQUIRED')
    if (!TASK_STATUSES.includes(status)) throw new Error('TASK_STATUS_INVALID')
    if (!Number.isSafeInteger(index) || index < 0)
      throw new Error('TASK_MOVE_INVALID')

    return db.transaction('rw', db.projects, db.tasks, async () => {
      const task = await db.tasks.get(taskId)
      if (!task) throw new Error('TASK_NOT_FOUND')
      if (task.projectId !== projectId) throw new Error('TASK_MOVE_INVALID')
      await assertProjectExists(projectId)
      if (!TASK_STATUSES.includes(task.status))
        throw new Error('TASK_STATUS_INVALID')
      if (
        expectedUpdatedAt !== undefined &&
        task.updatedAt !== expectedUpdatedAt
      )
        throw new Error('TASK_MOVE_CONFLICT')

      // Re-read both affected columns inside the transaction; never trust a UI snapshot of all tasks.
      const projectTasks = await getTasks(projectId)
      const sourceColumn = projectTasks.filter(
        (item) => item.status === task.status,
      )
      const targetColumn = projectTasks.filter(
        (item) => item.status === status && item.id !== taskId,
      )
      if (index > targetColumn.length) throw new Error('TASK_MOVE_INVALID')
      const sourceIndex = sourceColumn.findIndex((item) => item.id === taskId)
      if (task.status === status && sourceIndex === index) return task

      targetColumn.splice(index, 0, task)
      const columnOrders = [targetColumn]
      if (task.status !== status)
        columnOrders.push(sourceColumn.filter((item) => item.id !== taskId))
      const timestamp = new Date().toISOString()
      let completedAt = null
      if (status === 'done')
        completedAt =
          task.status === 'done' && task.completedAt
            ? task.completedAt
            : timestamp
      const updates = []
      for (const column of columnOrders) {
        column.forEach((item, position) => {
          const nextStatus = item.id === taskId ? status : item.status
          if (item.position === position && item.status === nextStatus) return
          updates.push({
            ...item,
            position,
            status: nextStatus,
            updatedAt: timestamp,
            completedAt: item.id === taskId ? completedAt : item.completedAt,
          })
        })
      }
      await db.tasks.bulkPut(updates)
      return updates.find((item) => item.id === taskId) ?? task
    })
  }

  return { getTasks, getTaskById, createTask, updateTask, deleteTask, moveTask }
}

export const taskRepository = createTaskRepository()
