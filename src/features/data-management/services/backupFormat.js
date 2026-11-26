import { normalizeProjectData } from '@/features/projects/services/projectRepository'
import { normalizeTaskData } from '@/features/tasks/services/taskRepository'

export const BACKUP_FORMAT = 'saturnino-backup'
export const BACKUP_VERSION = 1
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024
const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

function invalid() {
  throw new Error('BACKUP_INVALID')
}
function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid()
}
function exactKeys(value, keys) {
  if (
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  )
    invalid()
}
function identifier(value) {
  if (typeof value !== 'string' || !uuidPattern.test(value)) invalid()
  return value.toLowerCase()
}
function timestamp(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  )
    invalid()
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) invalid()
  return value
}
function dates(record) {
  const createdAt = timestamp(record.createdAt)
  const updatedAt = timestamp(record.updatedAt)
  if (updatedAt < createdAt) invalid()
  return { createdAt, updatedAt }
}

export function validateBackup(value) {
  object(value)
  exactKeys(value, ['format', 'version', 'exportedAt', 'projects', 'tasks'])
  if (value.format !== BACKUP_FORMAT) invalid()
  if (value.version !== BACKUP_VERSION)
    throw new Error('BACKUP_VERSION_UNSUPPORTED')
  const exportedAt = timestamp(value.exportedAt)
  if (!Array.isArray(value.projects) || !Array.isArray(value.tasks)) invalid()
  const projectIds = new Set()
  const taskIds = new Set()
  const positions = new Set()
  let projects
  let tasks
  try {
    projects = value.projects.map((project) => {
      object(project)
      exactKeys(project, [
        'id',
        'name',
        'description',
        'color',
        'isFavorite',
        'createdAt',
        'updatedAt',
      ])
      const id = identifier(project.id)
      if (projectIds.has(id) || typeof project.isFavorite !== 'boolean')
        invalid()
      projectIds.add(id)
      return {
        id,
        ...normalizeProjectData(project),
        isFavorite: project.isFavorite,
        ...dates(project),
      }
    })
    tasks = value.tasks.map((task) => {
      object(task)
      exactKeys(task, [
        'id',
        'projectId',
        'title',
        'description',
        'status',
        'priority',
        'dueDate',
        'position',
        'createdAt',
        'updatedAt',
        'completedAt',
      ])
      const id = identifier(task.id)
      const projectId = identifier(task.projectId)
      if (taskIds.has(id) || !projectIds.has(projectId)) invalid()
      taskIds.add(id)
      const data = normalizeTaskData({ ...task, projectId })
      if (!Number.isSafeInteger(task.position) || task.position < 0) invalid()
      const slot = `${projectId}:${data.status}:${task.position}`
      if (positions.has(slot)) invalid()
      positions.add(slot)
      const recordDates = dates(task)
      let completedAt = null
      if (data.status === 'done') {
        completedAt = timestamp(task.completedAt)
        if (
          completedAt < recordDates.createdAt ||
          completedAt > recordDates.updatedAt
        )
          invalid()
      } else if (task.completedAt !== null) invalid()
      return {
        id,
        ...data,
        position: task.position,
        ...recordDates,
        completedAt,
      }
    })
  } catch {
    invalid()
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt,
    projects,
    tasks,
  }
}

export function parseBackup(text) {
  if (typeof text !== 'string') invalid()
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES)
    throw new Error('BACKUP_TOO_LARGE')
  let value
  try {
    value = JSON.parse(text.replace(/^\uFEFF/, ''))
  } catch {
    invalid()
  }
  return validateBackup(value)
}

export function serializeBackup(
  snapshot,
  exportedAt = new Date().toISOString(),
) {
  const backup = validateBackup({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt,
    ...snapshot,
  })
  const text = JSON.stringify(backup, null, 2)
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES)
    throw new Error('BACKUP_TOO_LARGE')
  return text
}

export function getWorkspaceRevision(snapshot) {
  const canonical = (records) =>
    records
      .toSorted((a, b) => a.id.localeCompare(b.id))
      .map((record) =>
        Object.fromEntries(
          Object.entries(record).sort(([a], [b]) => a.localeCompare(b)),
        ),
      )
  return JSON.stringify({
    projects: canonical(snapshot.projects),
    tasks: canonical(snapshot.tasks),
  })
}
