import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDatabase } from '@/lib/db/database'
import { createProjectRepository } from '@/features/projects/services/projectRepository'

import { createTaskRepository } from './taskRepository'

describe('Task repository', () => {
  let db
  let repository
  let projectRepository
  let project

  beforeEach(async () => {
    db = createDatabase(`saturnino-tasks-${crypto.randomUUID()}`)
    await db.open()
    repository = createTaskRepository(db)
    projectRepository = createProjectRepository(db)
    project = await projectRepository.createProject({ name: 'Tasks project' })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await db.delete()
  })

  function createTask(data = {}) {
    return repository.createTask({
      projectId: project.id,
      title: 'Write task tests',
      ...data,
    })
  }

  it('starts empty and creates a normalized persistent task with defaults', async () => {
    expect(await repository.getTasks()).toEqual([])
    const task = await createTask({
      title: '  First task  ',
      description: '  Details  ',
    })
    expect(task).toEqual({
      id: expect.any(String),
      projectId: project.id,
      title: 'First task',
      description: 'Details',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      position: 0,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      completedAt: null,
    })
    expect(task.createdAt).toBe(task.updatedAt)
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt)
    expect(await repository.getTaskById(task.id)).toEqual(task)
    db.close()
    await db.open()
    expect(await repository.getTaskById(task.id)).toEqual(task)
  })

  it.each([
    [{ title: '' }, 'TASK_TITLE_REQUIRED'],
    [{ title: '   ' }, 'TASK_TITLE_REQUIRED'],
    [{ title: 2 }, 'TASK_TITLE_REQUIRED'],
    [{ title: 'x'.repeat(121) }, 'TASK_TITLE_TOO_LONG'],
    [{ description: null }, 'TASK_DESCRIPTION_INVALID'],
    [{ description: 'x'.repeat(2001) }, 'TASK_DESCRIPTION_INVALID'],
    [{ projectId: '' }, 'TASK_PROJECT_REQUIRED'],
    [{ projectId: null }, 'TASK_PROJECT_REQUIRED'],
    [{ projectId: 'missing' }, 'TASK_PROJECT_NOT_FOUND'],
    [{ status: 'unknown' }, 'TASK_STATUS_INVALID'],
    [{ priority: 'critical' }, 'TASK_PRIORITY_INVALID'],
    [{ dueDate: '2026-02-29' }, 'TASK_DUE_DATE_INVALID'],
    [{ dueDate: '2026-04-31' }, 'TASK_DUE_DATE_INVALID'],
    [{ dueDate: '26/11/2026' }, 'TASK_DUE_DATE_INVALID'],
    [{ dueDate: 123 }, 'TASK_DUE_DATE_INVALID'],
  ])('rejects invalid input without persisting: %j', async (data, error) => {
    await expect(createTask(data)).rejects.toThrow(error)
    expect(await db.tasks.count()).toBe(0)
  })

  it.each([null, [], 'task'])(
    'rejects non-object task data: %j',
    async (data) => {
      await expect(repository.createTask(data)).rejects.toThrow(
        'TASK_DATA_INVALID',
      )
    },
  )

  it('accepts boundary lengths, valid leap dates and an empty optional date', async () => {
    const task = await createTask({
      title: 'x'.repeat(120),
      description: 'x'.repeat(2000),
      dueDate: '2028-02-29',
    })
    expect(task.dueDate).toBe('2028-02-29')
    expect((await createTask({ dueDate: '' })).dueDate).toBeNull()
  })

  it('assigns distinct append positions atomically during concurrent creation', async () => {
    const tasks = await Promise.all([createTask(), createTask(), createTask()])
    expect(new Set(tasks.map((task) => task.id)).size).toBe(3)
    expect(tasks.map((task) => task.position).sort()).toEqual([0, 1, 2])
    expect((await createTask({ status: 'backlog' })).position).toBe(0)
  })

  it('lists tasks within a project without leaking other projects', async () => {
    const other = await projectRepository.createProject({ name: 'Other' })
    const task = await createTask()
    await createTask({ projectId: other.id })
    expect(await repository.getTasks(project.id)).toEqual([task])
    expect(await repository.getTasks()).toHaveLength(2)
    expect(await repository.getTasks('missing')).toEqual([])
  })

  it('updates fields while preserving identity, creation and same-column position', async () => {
    const task = await createTask()
    await db.tasks.update(task.id, { updatedAt: '2020-01-01T00:00:00.000Z' })
    const updated = await repository.updateTask(task.id, {
      ...task,
      title: 'Updated',
      priority: 'urgent',
      dueDate: '2026-12-20',
    })
    expect(updated).toMatchObject({
      id: task.id,
      createdAt: task.createdAt,
      position: task.position,
      title: 'Updated',
      priority: 'urgent',
      dueDate: '2026-12-20',
    })
    expect(updated.updatedAt).not.toBe('2020-01-01T00:00:00.000Z')
    expect(await repository.getTaskById(task.id)).toEqual(updated)
  })

  it('tracks completion, preserves its instant on edit and clears it on reopening', async () => {
    const task = await createTask({ status: 'done' })
    expect(task.completedAt).toBe(task.createdAt)
    const edited = await repository.updateTask(task.id, {
      ...task,
      title: 'Edited done task',
    })
    expect(edited.completedAt).toBe(task.completedAt)
    const reopened = await repository.updateTask(task.id, {
      ...edited,
      status: 'todo',
    })
    expect(reopened.completedAt).toBeNull()
    const completed = await repository.updateTask(task.id, {
      ...reopened,
      status: 'done',
    })
    expect(completed.completedAt).toBe(completed.updatedAt)
  })

  it('appends when changing status or project', async () => {
    await createTask({ status: 'done' })
    const task = await createTask()
    expect(
      (await repository.updateTask(task.id, { ...task, status: 'done' }))
        .position,
    ).toBe(1)
    const other = await projectRepository.createProject({ name: 'Destination' })
    await createTask({ projectId: other.id })
    const moved = await repository.updateTask(task.id, {
      ...task,
      projectId: other.id,
    })
    expect(moved.position).toBe(1)
    expect(await repository.getTasks(project.id)).toHaveLength(1)
  })

  it('rejects missing entities and invalid updates without changing records', async () => {
    const task = await createTask()
    await expect(repository.updateTask('missing', task)).rejects.toThrow(
      'TASK_NOT_FOUND',
    )
    await expect(
      repository.updateTask(task.id, { ...task, projectId: 'missing' }),
    ).rejects.toThrow('TASK_PROJECT_NOT_FOUND')
    await expect(
      repository.updateTask(task.id, { ...task, title: '' }),
    ).rejects.toThrow('TASK_TITLE_REQUIRED')
    expect(await repository.getTaskById(task.id)).toEqual(task)
  })

  it('preserves the previous task after a failed write', async () => {
    const task = await createTask()
    vi.spyOn(db.tasks, 'put').mockRejectedValueOnce(new Error('WRITE_FAILED'))
    await expect(
      repository.updateTask(task.id, { ...task, status: 'done' }),
    ).rejects.toThrow('WRITE_FAILED')
    expect(await repository.getTaskById(task.id)).toEqual(task)
  })

  it('deletes only the selected task and rejects repeated deletion', async () => {
    const first = await createTask()
    const second = await createTask()
    await repository.deleteTask(first.id)
    expect(await repository.getTaskById(first.id)).toBeUndefined()
    expect(await repository.getTaskById(second.id)).toEqual(second)
    await expect(repository.deleteTask(first.id)).rejects.toThrow(
      'TASK_NOT_FOUND',
    )
  })

  it('cannot create an orphan while the project is deleted concurrently', async () => {
    await Promise.allSettled([
      createTask(),
      projectRepository.deleteProject(project.id),
    ])
    expect(await db.projects.get(project.id)).toBeUndefined()
    expect(await db.tasks.where('projectId').equals(project.id).count()).toBe(0)
    await expect(createTask()).rejects.toThrow('TASK_PROJECT_NOT_FOUND')
  })
  it('rejects stale edits atomically, including two writes in the same clock tick', async () => {
    const task = await createTask()
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse(task.updatedAt))
    const updated = await repository.updateTask(
      task.id,
      { ...task, title: 'Other tab' },
      { expectedUpdatedAt: task.updatedAt },
    )
    expect(updated.updatedAt).not.toBe(task.updatedAt)
    await expect(
      repository.updateTask(
        task.id,
        { ...task, title: 'Stale draft' },
        { expectedUpdatedAt: task.updatedAt },
      ),
    ).rejects.toThrow('TASK_UPDATE_CONFLICT')
    expect((await repository.getTaskById(task.id)).title).toBe('Other tab')
    const current = await repository.updateTask(
      task.id,
      { ...updated, title: 'Reviewed' },
      { expectedUpdatedAt: updated.updatedAt },
    )
    expect(current.title).toBe('Reviewed')
  })
})
