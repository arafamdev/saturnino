import 'fake-indexeddb/auto'
import { afterEach, expect, it } from 'vitest'
import { createDatabase } from './database'
import { createWorkspaceRepository } from './workspaceRepository'
import { createProjectRepository } from '@/features/projects/services/projectRepository'
import { createTaskRepository } from '@/features/tasks/services/taskRepository'
const db = createDatabase(`snapshot-${crypto.randomUUID()}`)
afterEach(async () => db.delete())
it('reads both entities and reflects an atomic project deletion', async () => {
  const projects = createProjectRepository(db)
  const tasks = createTaskRepository(db)
  const repository = createWorkspaceRepository(db)
  const project = await projects.createProject({ name: 'Snapshot QA' })
  const task = await tasks.createTask({
    projectId: project.id,
    title: 'Snapshot task',
  })
  expect(await repository.getSnapshot()).toEqual({
    projects: [project],
    tasks: [task],
  })
  await projects.deleteProject(project.id)
  expect(await repository.getSnapshot()).toEqual({ projects: [], tasks: [] })
})
