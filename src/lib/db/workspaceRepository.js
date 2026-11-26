import { database } from './database'

export function createWorkspaceRepository(db = database) {
  async function getSnapshot() {
    return db.transaction('r', db.projects, db.tasks, async () => {
      const [projects, tasks] = await Promise.all([
        db.projects.toArray(),
        db.tasks.toArray(),
      ])
      return { projects, tasks }
    })
  }
  return { getSnapshot }
}

export const workspaceRepository = createWorkspaceRepository()
