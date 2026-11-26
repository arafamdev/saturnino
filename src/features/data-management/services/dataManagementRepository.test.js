import 'fake-indexeddb/auto'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createDatabase } from '@/lib/db/database'
import { createWorkspaceRepository } from '@/lib/db/workspaceRepository'
import { createProjectRepository } from '@/features/projects/services/projectRepository'
import { createTaskRepository } from '@/features/tasks/services/taskRepository'
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  getWorkspaceRevision,
} from './backupFormat'
import { createDataManagementRepository } from './dataManagementRepository'
let db, workspace, repository, projects, tasks, original
beforeEach(async () => {
  db = createDatabase(`restore-${crypto.randomUUID()}`)
  workspace = createWorkspaceRepository(db)
  repository = createDataManagementRepository(db)
  projects = createProjectRepository(db)
  tasks = createTaskRepository(db)
  const project = await projects.createProject({ name: 'Original QA' })
  await tasks.createTask({ projectId: project.id, title: 'Original task' })
  original = await workspace.getSnapshot()
})
afterEach(async () => {
  vi.restoreAllMocks()
  await db.delete()
})
function backup() {
  const project = {
    ...original.projects[0],
    id: crypto.randomUUID(),
    name: 'Restored QA',
    isFavorite: true,
  }
  const task = {
    ...original.tasks[0],
    id: crypto.randomUUID(),
    projectId: project.id,
    title: 'Restored task',
    position: 4,
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    projects: [project],
    tasks: [task],
  }
}
it('replaces both tables preserving imported identities and metadata', async () => {
  const incoming = backup()
  expect(
    await repository.restoreBackup(incoming, getWorkspaceRevision(original)),
  ).toEqual({ projectCount: 1, taskCount: 1 })
  expect(await workspace.getSnapshot()).toEqual({
    projects: incoming.projects,
    tasks: incoming.tasks,
  })
})
it('rolls back clears and both inserts if the final write fails', async () => {
  const bulkAdd = db.tasks.bulkAdd.bind(db.tasks)
  vi.spyOn(db.tasks, 'bulkAdd').mockImplementationOnce(async (...args) => {
    await bulkAdd(...args)
    throw new Error('WRITE_FAILED')
  })
  await expect(
    repository.restoreBackup(backup(), getWorkspaceRevision(original)),
  ).rejects.toThrow('WRITE_FAILED')
  expect(await workspace.getSnapshot()).toEqual(original)
})
it('rejects invalid relationships before any data can be replaced', async () => {
  const incoming = backup()
  incoming.projects = []
  await expect(
    repository.restoreBackup(incoming, getWorkspaceRevision(original)),
  ).rejects.toThrow('BACKUP_INVALID')
  expect(await workspace.getSnapshot()).toEqual(original)
})
it('refuses to replace records changed after preview, including favorite-only changes', async () => {
  await projects.toggleProjectFavorite(original.projects[0].id)
  const changed = await workspace.getSnapshot()
  await expect(
    repository.restoreBackup(backup(), getWorkspaceRevision(original)),
  ).rejects.toThrow('WORKSPACE_CHANGED')
  expect(await workspace.getSnapshot()).toEqual(changed)
})
it('requires a reviewed revision', async () => {
  await expect(repository.restoreBackup(backup())).rejects.toThrow(
    'WORKSPACE_CHANGED',
  )
  expect(await workspace.getSnapshot()).toEqual(original)
})
it('supports an explicitly confirmed empty backup atomically', async () => {
  const incoming = { ...backup(), projects: [], tasks: [] }
  await repository.restoreBackup(incoming, getWorkspaceRevision(original))
  expect(await workspace.getSnapshot()).toEqual({ projects: [], tasks: [] })
})
it('serializes competing restores and rejects the one whose reviewed snapshot is stale', async () => {
  const revision = getWorkspaceRevision(original)
  const outcomes = await Promise.allSettled([
    repository.restoreBackup(backup(), revision),
    repository.restoreBackup(backup(), revision),
  ])
  expect(outcomes.filter((item) => item.status === 'fulfilled')).toHaveLength(1)
  expect(
    outcomes.find((item) => item.status === 'rejected').reason.message,
  ).toBe('WORKSPACE_CHANGED')
  const result = await workspace.getSnapshot()
  expect(result.projects).toHaveLength(1)
  expect(result.tasks).toHaveLength(1)
  expect(result.tasks[0].projectId).toBe(result.projects[0].id)
})
