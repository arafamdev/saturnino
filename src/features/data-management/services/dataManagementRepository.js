import { database } from '@/lib/db/database'
import { createWorkspaceRepository } from '@/lib/db/workspaceRepository'
import { getWorkspaceRevision, validateBackup } from './backupFormat'

export function createDataManagementRepository(db = database) {
  async function restoreBackup(value, expectedRevision) {
    const backup = validateBackup(value)
    if (typeof expectedRevision !== 'string' || !expectedRevision)
      throw new Error('WORKSPACE_CHANGED')
    return db.transaction('rw', db.projects, db.tasks, async () => {
      const current = await createWorkspaceRepository(db).getSnapshot()
      if (getWorkspaceRevision(current) !== expectedRevision)
        throw new Error('WORKSPACE_CHANGED')
      await db.tasks.clear()
      await db.projects.clear()
      await db.projects.bulkAdd(backup.projects)
      await db.tasks.bulkAdd(backup.tasks)
      return {
        projectCount: backup.projects.length,
        taskCount: backup.tasks.length,
      }
    })
  }
  return { restoreBackup }
}
export const dataManagementRepository = createDataManagementRepository()
