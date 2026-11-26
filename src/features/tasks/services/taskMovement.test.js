import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDatabase } from '@/lib/db/database'
import { createProjectRepository } from '@/features/projects/services/projectRepository'

import { createTaskRepository } from './taskRepository'

describe('Transactional task movement', () => {
  let db
  let repository
  let projectRepository
  let project
  let tasks

  beforeEach(async () => {
    db = createDatabase(`saturnino-movement-${crypto.randomUUID()}`)
    await db.open()
    repository = createTaskRepository(db)
    projectRepository = createProjectRepository(db)
    project = await projectRepository.createProject({ name: 'Board project' })
    tasks = []
    for (const title of ['First', 'Second', 'Third'])
      tasks.push(await repository.createTask({ projectId: project.id, title }))
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await db.delete()
  })

  async function column(status) {
    return (await repository.getTasks(project.id)).filter(
      (task) => task.status === status,
    )
  }

  function move(task, status, index, extra = {}) {
    return repository.moveTask(task.id, {
      projectId: project.id,
      status,
      index,
      ...extra,
    })
  }

  it('reorders forward and backward with contiguous positions', async () => {
    await move(tasks[0], 'todo', 2)
    expect((await column('todo')).map((task) => task.title)).toEqual([
      'Second',
      'Third',
      'First',
    ])
    expect((await column('todo')).map((task) => task.position)).toEqual([
      0, 1, 2,
    ])
    await move(tasks[0], 'todo', 0)
    expect((await column('todo')).map((task) => task.title)).toEqual([
      'First',
      'Second',
      'Third',
    ])
  })

  it('updates both columns atomically and preserves task identity', async () => {
    const existing = await repository.createTask({
      projectId: project.id,
      title: 'Already done',
      status: 'done',
    })
    const moved = await move(tasks[1], 'done', 0)
    expect((await column('todo')).map((task) => task.position)).toEqual([0, 1])
    expect((await column('done')).map((task) => task.id)).toEqual([
      moved.id,
      existing.id,
    ])
    expect((await column('done')).map((task) => task.position)).toEqual([0, 1])
    expect(moved).toMatchObject({
      id: tasks[1].id,
      title: tasks[1].title,
      createdAt: tasks[1].createdAt,
      priority: 'medium',
      status: 'done',
      position: 0,
    })
    expect(moved.completedAt).toBe(moved.updatedAt)
  })

  it('supports an empty destination and clears completion on reopening', async () => {
    const done = await move(tasks[0], 'done', 0)
    const reopened = await move(done, 'in-progress', 0)
    expect(reopened.completedAt).toBeNull()
    expect(await column('done')).toEqual([])
    expect((await column('in-progress'))[0].id).toBe(done.id)
  })

  it('preserves completion when reordering done tasks', async () => {
    const first = await move(tasks[0], 'done', 0)
    await move(tasks[1], 'done', 1)
    expect((await move(first, 'done', 1)).completedAt).toBe(first.completedAt)
  })

  it('does not write or change timestamps for a no-op', async () => {
    const spy = vi.spyOn(db.tasks, 'bulkPut')
    expect(await move(tasks[0], 'todo', 0)).toEqual(tasks[0])
    expect(spy).not.toHaveBeenCalled()
  })

  it.each([
    [{ index: -1 }, 'TASK_MOVE_INVALID'],
    [{ index: 0.5 }, 'TASK_MOVE_INVALID'],
    [{ index: 20 }, 'TASK_MOVE_INVALID'],
    [{ status: 'unknown' }, 'TASK_STATUS_INVALID'],
    [{ projectId: null }, 'TASK_PROJECT_REQUIRED'],
    [{ projectId: 'another-project' }, 'TASK_MOVE_INVALID'],
  ])(
    'rejects invalid movements without changing any tasks: %j',
    async (data, error) => {
      const before = await repository.getTasks()
      await expect(
        repository.moveTask(tasks[0].id, {
          projectId: project.id,
          status: 'done',
          index: 0,
          ...data,
        }),
      ).rejects.toThrow(error)
      expect(await repository.getTasks()).toEqual(before)
    },
  )

  it.each([null, undefined, []])(
    'rejects malformed movement requests: %j',
    async (movement) => {
      await expect(repository.moveTask(tasks[0].id, movement)).rejects.toThrow(
        'TASK_MOVE_INVALID',
      )
    },
  )

  it('rejects a stale source snapshot without overwriting a newer edit', async () => {
    await db.tasks.update(tasks[0].id, {
      title: 'Edited elsewhere',
      updatedAt: '2026-12-01T12:00:00.000Z',
    })
    await expect(
      move(tasks[0], 'done', 0, { expectedUpdatedAt: tasks[0].updatedAt }),
    ).rejects.toThrow('TASK_MOVE_CONFLICT')
    expect(await repository.getTaskById(tasks[0].id)).toMatchObject({
      title: 'Edited elsewhere',
      status: 'todo',
    })
  })

  it('rolls back both columns when writing positions fails', async () => {
    await repository.createTask({
      projectId: project.id,
      title: 'Done',
      status: 'done',
    })
    const before = await repository.getTasks()
    const originalBulkPut = db.tasks.bulkPut.bind(db.tasks)
    vi.spyOn(db.tasks, 'bulkPut').mockImplementationOnce(async (updates) => {
      await originalBulkPut(updates)
      throw new Error('WRITE_FAILED_AFTER_UPDATE')
    })
    await expect(move(tasks[1], 'done', 0)).rejects.toThrow(
      'WRITE_FAILED_AFTER_UPDATE',
    )
    expect(await repository.getTasks()).toEqual(before)
  })

  it('preserves unrelated projects and accepts concurrent independent moves', async () => {
    const other = await projectRepository.createProject({ name: 'Other' })
    const unrelated = await repository.createTask({
      projectId: other.id,
      title: 'Unrelated',
    })
    await Promise.all([move(tasks[0], 'done', 0), move(tasks[1], 'done', 0)])
    expect((await column('todo')).map((task) => task.position)).toEqual([0])
    expect((await column('done')).map((task) => task.position)).toEqual([0, 1])
    expect(await repository.getTaskById(unrelated.id)).toEqual(unrelated)
  })

  it('rejects a task removed by project deletion without recreating records', async () => {
    await projectRepository.deleteProject(project.id)
    await expect(move(tasks[0], 'done', 0)).rejects.toThrow('TASK_NOT_FOUND')
    expect(await db.tasks.count()).toBe(0)
  })
})
