import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createDatabase } from './database'

describe('Local database', () => {
  let database

  beforeEach(async () => {
    database = createDatabase(`saturnino-test-${crypto.randomUUID()}`)

    await database.open()
  })

  afterEach(async () => {
    await database.delete()
  })

  it('creates the expected object stores', () => {
    const tableNames = database.tables.map((table) => table.name)

    expect(tableNames).toEqual(expect.arrayContaining(['projects', 'tasks']))
    expect(tableNames).toHaveLength(2)
  })

  it('uses the expected schema version', () => {
    expect(database.verno).toBe(1)
  })

  it('stores and retrieves a project', async () => {
    const project = {
      id: 'project-1',
      name: 'Portfolio',
    }

    await database.projects.add(project)

    const savedProject = await database.projects.get(project.id)

    expect(savedProject).toEqual(project)
  })

  it('rejects duplicate primary keys', async () => {
    await database.projects.add({
      id: 'project-1',
      name: 'Portfolio',
    })

    await expect(
      database.projects.add({
        id: 'project-1',
        name: 'Another project',
      }),
    ).rejects.toMatchObject({
      name: 'ConstraintError',
    })
  })

  it('preserves records after closing and reopening the database', async () => {
    const project = {
      id: 'project-1',
      name: 'Portfolio',
    }

    await database.projects.add(project)

    database.close()

    await database.open()

    const savedProject = await database.projects.get(project.id)

    expect(savedProject).toEqual(project)
  })

  it('finds tasks by project ID', async () => {
    await database.tasks.bulkAdd([
      { id: 'task-1', projectId: 'project-1' },
      { id: 'task-2', projectId: 'project-1' },
      { id: 'task-3', projectId: 'project-2' },
    ])

    const projectTasks = await database.tasks
      .where('projectId')
      .equals('project-1')
      .toArray()

    expect(projectTasks.map((task) => task.id)).toEqual(['task-1', 'task-2'])
  })

  it('retrieves column tasks ordered by position', async () => {
    await database.tasks.bulkAdd([
      {
        id: 'task-1',
        projectId: 'project-1',
        status: 'todo',
        position: 1,
      },
      {
        id: 'task-2',
        projectId: 'project-1',
        status: 'todo',
        position: 0,
      },
      {
        id: 'task-3',
        projectId: 'project-1',
        status: 'done',
        position: 0,
      },
    ])

    const columnTasks = await database.tasks
      .where('[projectId+status+position]')
      .between(
        ['project-1', 'todo', 0],
        ['project-1', 'todo', Infinity],
        true,
        true,
      )
      .toArray()

    expect(columnTasks.map((task) => task.id)).toEqual(['task-2', 'task-1'])
  })

  it('rolls back changes when a transaction fails', async () => {
    await expect(
      database.transaction(
        'rw',
        database.projects,
        database.tasks,
        async () => {
          await database.projects.add({
            id: 'project-1',
            name: 'Portfolio',
          })

          await database.tasks.add({
            id: 'task-1',
            projectId: 'project-1',
          })

          throw new Error('Transaction failed')
        },
      ),
    ).rejects.toThrow('Transaction failed')

    expect(await database.projects.count()).toBe(0)
    expect(await database.tasks.count()).toBe(0)
  })
})
